#!/usr/bin/env node
'use strict';

/**
 * Neutral-reference check (ADR-0016, ADR-0023). conventions/neutral-reference.md.
 *
 * Keeps Shed's business out of what this repository publishes. Scans the tree
 * and, on a pull_request event, the pull request body and the commit messages
 * in that pull request only. It does not read commit authors or committers,
 * or commits outside the pull request range. Not a policy entry:
 * scripts/check-policy.js is capped at 10.
 *
 * The co-author trailer rule is separate (conventions/attribution.md). It
 * reads only the commit messages in the pull request range, and shares this
 * script so those commits are fetched once.
 *
 * The platform wraps the pull request body in CURSOR_AGENT_PR_BODY_BEGIN / END
 * and appends a footer after the end marker. Only the text between the markers
 * is checked. A body without the markers is checked in full.
 *
 * This file is not scanned. It holds the patterns.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const SELF = 'scripts/check-neutral.js';
const PHRASE_EXEMPT = new Set(['conventions/neutral-reference.md']);
const KEY_PREFIXES = new Set(['GH', 'ADR', 'ACME', 'TICKET']);

const BEGIN = '<!-- CURSOR_AGENT_PR_BODY_BEGIN -->';
const END = '<!-- CURSOR_AGENT_PR_BODY_END -->';

function authorBody(raw) {
  const text = raw || '';
  const start = text.indexOf(BEGIN);
  const finish = text.indexOf(END);
  if (start !== -1 && finish > start) {
    return text.slice(start + BEGIN.length, finish);
  }
  return text;
}

function emailAllowed(address) {
  const at = address.lastIndexOf('@');
  if (at < 1) return false;
  const local = address.slice(0, at);
  const domain = address.slice(at + 1).toLowerCase();
  if (local === 'git' && domain === 'github.com') return true;
  const labels = domain.split('.');
  const example = labels.indexOf('example');
  return example !== -1 && example < labels.length - 1;
}

function scan(rel, text) {
  const hits = [];
  const phraseExempt = PHRASE_EXEMPT.has(rel);
  const lines = String(text).split('\n');
  lines.forEach((line, index) => {
    const lineNo = index + 1;
    const add = (rule) => {
      const excerpt = line.trim().slice(0, 180);
      hits.push(`${rel}:${lineNo} ${rule}${excerpt ? `: ${excerpt}` : ''}`);
    };

    for (const match of line.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
      if (!emailAllowed(match[0])) add('email');
    }
    // A Slack id is an uppercase token that contains a digit. A word such as
    // CODEOWNERS or UNLICENSED is not one.
    if (/(?<![A-Za-z0-9])[CDUW](?=[A-Z0-9]*\d)[A-Z0-9]{8,11}(?![A-Za-z0-9])/.test(line)) add('slack id');
    if (/[A-Za-z0-9.-]+\.atlassian\.net/i.test(line)) add('atlassian host');

    if (!phraseExempt && /\b(ask|tell|ping)\s+me\b/i.test(line)) add('ask/tell/ping me');
    if (!phraseExempt && /\bmy\s+(pr|repo|agent)\b/i.test(line)) add('my pr/repo/agent');

    // A letter prefix and a number of at least two digits. One-digit forms
    // such as utf-8 and PSR-4 are standards, not keys.
    for (const match of line.matchAll(/\b([A-Za-z]{2,10})-(\d{2,})\b/g)) {
      if (!KEY_PREFIXES.has(match[1].toUpperCase())) add(`ticket key ${match[0]}`);
    }
  });
  return hits;
}

function trailerHits(label, message) {
  const hits = [];
  String(message).split('\n').forEach((line, index) => {
    if (/^\s*co-authored-by\s*:/i.test(line)) hits.push(`${label}:${index + 1} co-author trailer`);
  });
  return hits;
}

function commitHits(item) {
  const label = `commit ${(item.sha || '').slice(0, 7)}`;
  const message = (item.commit && item.commit.message) || '';
  return [...scan(label, message), ...trailerHits(label, message)];
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'vendor') continue;
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function treeHits() {
  const hits = [];
  for (const file of walk(root)) {
    const rel = path.relative(root, file);
    if (rel === SELF) continue;
    const data = fs.readFileSync(file);
    if (data.includes(0)) continue;
    hits.push(...scan(rel, data.toString('utf8')));
  }
  return hits;
}

function nextLink(header) {
  if (!header) return '';
  const match = header.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : '';
}

async function pullRequestHits() {
  if (process.env.GITHUB_EVENT_NAME !== 'pull_request') return [];
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) return [];
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const pr = event.pull_request;
  if (!pr) return [];

  const hits = scan('pull request body', authorBody(pr.body || ''));
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo || !pr.number) {
    throw new Error('check-neutral: a pull request is in context, and reading its commits needs GITHUB_TOKEN and GITHUB_REPOSITORY');
  }

  let url = `https://api.github.com/repos/${repo}/pulls/${pr.number}/commits?per_page=100`;
  while (url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'neat-os-check-neutral',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`check-neutral: could not read pull request commits (${response.status}) ${detail.slice(0, 200)}`);
    }
    const data = await response.json();
    for (const item of data) hits.push(...commitHits(item));
    url = data.length < 100 ? '' : nextLink(response.headers.get('link'));
  }
  return hits;
}

function assertCase(label, hits, forbidden) {
  const failed = forbidden ? hits.length === 0 : hits.length > 0;
  if (failed) {
    throw new Error(`check-neutral self-test ${label}: ${hits.join(' | ') || 'expected a hit'}`);
  }
}

function selfTest() {
  assertCase('example mailbox', scan('t', 'write dev@example.com and a@example.org'), false);
  assertCase('mailbox', scan('t', 'write dev@elsewhere.test'), true);
  assertCase('git ssh', scan('t', 'git@github.com'), false);
  assertCase('publisher scope and url host', scan('t', "path.join('@shedcollective', 'neat-os') and " + '${GH_TOKEN}@github.com'), false);
  assertCase('people may be named', scan('t', 'Reviewed by @someone, @<login>, and a named person.'), false);
  assertCase('allowed keys', scan('t', 'GH-42 ADR-0016 ACME-123 TICKET-99 acme-42'), false);
  assertCase('ticket key', scan('t', 'see ZZ-99'), true);
  assertCase('not a ticket key', scan('t', 'utf-8 psr-4 PSR-4 v0-1 feature/gh-19-v0-1-0-batch'), false);
  assertCase('not a slack id', scan('t', 'CODEOWNERS UNLICENSED GITHUB_WORKSPACE CANDIDATE'), false);
  assertCase('slack', scan('t', 'ping U0123456789'), true);
  assertCase('atlassian', scan('t', 'https://acme.atlassian.net/browse/ACME-1'), true);
  assertCase('phrases', scan('t', 'please ask me about my repo'), true);
  assertCase('convention may name the phrase', scan('conventions/neutral-reference.md', 'Do not write ask me'), false);
  assertCase('trailer is not a neutral rule', scan('t', 'Do not add a Co-authored-by trailer'), false);
  assertCase('trailer', trailerHits('c', 'docs: record the rule\n\nCo-authored-by: A <a@example.com>\n'), true);
  assertCase('trailer in any case', trailerHits('c', 'docs: record the rule\n\n  co-authored-by: A <a@example.com>'), true);
  assertCase('trailer named in prose', trailerHits('c', 'docs: record the rule\n\nThe Co-authored-by rule stays.'), false);
  assertCase(
    'commit identity is not read',
    commitHits({
      sha: 'abcdef0',
      commit: {
        message: 'docs: record the rule (GH-38)\n',
        author: { name: 'Example Developer', email: 'dev@elsewhere.test' },
        committer: { name: 'Example Bot', email: 'bot@elsewhere.test' },
      },
    }),
    false,
  );
  assertCase(
    'commit trailer',
    commitHits({
      sha: 'abcdef1',
      commit: { message: 'docs: record the rule\n\nCo-authored-by: A <a@example.com>\n' },
    }),
    true,
  );
  const wrapped = `${BEGIN}\nACME-1 is fine\n${END}\nCo-authored-by: Bot <bot@elsewhere.test>\nplease ask me`;
  assertCase('platform footer', scan('pull request body', authorBody(wrapped)), false);
  assertCase('unmarked body', scan('pull request body', authorBody('please ask me')), true);
}

function help() {
  console.log(`Usage: node scripts/check-neutral.js

Scans the repository for the neutral-reference rules in conventions/neutral-reference.md.
In a GitHub Actions pull_request job, the pull request body and the commit messages in that pull request are checked too.
A commit message in that pull request also fails on a co-author trailer (conventions/attribution.md).
`);
}

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    help();
    return;
  }
  selfTest();
  const hits = [...treeHits(), ...(await pullRequestHits())];
  if (hits.length) {
    console.error(`check-neutral: ${hits.length} hit(s)`);
    for (const hit of hits) console.error(`  ${hit}`);
    process.exit(1);
  }
  console.log('check-neutral OK');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
