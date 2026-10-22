#!/usr/bin/env node
'use strict';

/**
 * Neutral-reference check (ADR-0016, ADR-0023).
 * conventions/neutral-reference.md and conventions/attribution.md.
 *
 * Scans the tree for client names and internal chat a public reference must
 * not carry. On a pull_request event it also checks each commit in that pull
 * request only: message, author email, and committer email. It does not read
 * commits outside the pull request range. Not a policy entry:
 * scripts/check-policy.js is capped at 10.
 *
 * The platform wraps the pull request body in CURSOR_AGENT_PR_BODY_BEGIN / END
 * and appends a footer after the end marker. Only the text between the markers
 * is checked. A body without the markers is checked in full.
 *
 * This file is not scanned. It holds the patterns and the allowlist.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const SELF = 'scripts/check-neutral.js';
const PHRASE_EXEMPT = new Set([
  'conventions/neutral-reference.md',
  'conventions/attribution.md',
]);
const KEY_PREFIXES = new Set(['GH', 'ADR', 'ACME', 'TICKET']);

const BEGIN = '<!-- CURSOR_AGENT_PR_BODY_BEGIN -->';
const END = '<!-- CURSOR_AGENT_PR_BODY_END -->';

const GITHUB_NOREPLY_SUFFIX = '@users.noreply.github.com';

// Shared identities that must not author or commit. The noreply local part
// credits an unrelated GitHub account with that login.
const BLOCKED_EMAILS = new Set([
  'noreply@users.noreply.github.com',
  'neat-os-build@users.noreply.github.com',
  'cursoragent@cursor.com',
]);

// Team GitHub noreply allowlist. To add a person, append { login, id }.
// id is the numeric field from https://api.github.com/users/<login>.
// The accepted author address is `${id}+${login}@users.noreply.github.com`.
// Seeded from that API on 22 October 2026: Shaun, Gary, Pablo.
const TEAM_NOREPLY = [
  { login: 'shauunhimseelf', id: '6403585' },
  { login: 'gsdd', id: '348198' },
  { login: 'hellopablo', id: '233585' },
];

function normaliseEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function teamNoreplyAddress(entry) {
  return `${entry.id}+${String(entry.login).toLowerCase()}${GITHUB_NOREPLY_SUFFIX}`;
}

function allowlistedAuthorEmails() {
  return new Set(TEAM_NOREPLY.map(teamNoreplyAddress));
}

function identityHits(label, authorEmail, committerEmail) {
  const hits = [];
  const author = normaliseEmail(authorEmail);
  const committer = normaliseEmail(committerEmail);
  const add = (rule) => hits.push(`${label} ${rule}`);
  if (!author) add('author email missing');
  if (!committer) add('committer email missing');
  if (BLOCKED_EMAILS.has(author)) add('blocked author email');
  if (BLOCKED_EMAILS.has(committer)) add('blocked committer email');
  if (author.endsWith(GITHUB_NOREPLY_SUFFIX) && !allowlistedAuthorEmails().has(author)) {
    add('author email is not an allowlisted GitHub noreply');
  }
  return hits;
}

function hitsForCommit(item) {
  const sha = (item.sha || '').slice(0, 7);
  const commit = item.commit || {};
  const hits = scan(`commit ${sha}`, commit.message || '');
  const authorEmail = commit.author && commit.author.email;
  const committerEmail = commit.committer && commit.committer.email;
  hits.push(...identityHits(`commit ${sha}`, authorEmail, committerEmail));
  return hits;
}

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

    const handle = /(^|[^A-Za-z0-9@])@([A-Za-z0-9][A-Za-z0-9-]{0,38})/g;
    for (const match of line.matchAll(handle)) {
      const login = match[2];
      const after = line.slice(match.index + match[0].length);
      if (/^\/[A-Za-z0-9][A-Za-z0-9._-]*/.test(after)) continue;
      // Publisher scope, including the split path form and @shedcollective:registry.
      if (login.toLowerCase() === 'shedcollective') continue;
      // CSS at-rules in SVG and stylesheets are not logins.
      if (login.toLowerCase() === 'media' || login.toLowerCase() === 'keyframes') continue;
      // userinfo@host in a URL, such as a token at github.com. Not a mention.
      if (after.startsWith('.')) continue;
      add('handle');
    }

    if (!phraseExempt && /co-authored-by/i.test(line)) add('co-author trailer');
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
    for (const item of data) hits.push(...hitsForCommit(item));
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
  assertCase('scope', scan('t', "require('@shedcollective/neat-os') and @acme/site"), false);
  assertCase('login placeholder', scan('t', 'assign @<login>'), false);
  assertCase('handle', scan('t', 'assign @someone'), true);
  assertCase('css at-rule', scan('t', '@media screen { @keyframes spin {} }'), false);
  assertCase('allowed keys', scan('t', 'GH-42 ADR-0016 ACME-123 TICKET-99 acme-42'), false);
  assertCase('ticket key', scan('t', 'see ZZ-99'), true);
  assertCase('not a ticket key', scan('t', 'utf-8 psr-4 PSR-4 v0-1 feature/gh-19-v0-1-0-batch'), false);
  assertCase('not a slack id', scan('t', 'CODEOWNERS UNLICENSED GITHUB_WORKSPACE CANDIDATE'), false);
  assertCase('publisher scope and url host', scan('t', "path.join('@shedcollective', 'neat-os') and " + '${GH_TOKEN}@github.com'), false);
  assertCase('slack', scan('t', 'ping U0123456789'), true);
  assertCase('atlassian', scan('t', 'https://acme.atlassian.net/browse/ACME-1'), true);
  assertCase('phrases', scan('t', 'please ask me about my repo'), true);
  assertCase('convention may name the phrase', scan('conventions/neutral-reference.md', 'Do not write ask me or Co-authored-by'), false);
  assertCase('attribution page may name the trailer', scan('conventions/attribution.md', 'Do not add a Co-authored-by trailer'), false);
  assertCase('trailer', scan('t', 'Co-authored-by: A <a@example.com>'), true);
  const seeded = [
    ['shauunhimseelf', '6403585'],
    ['gsdd', '348198'],
    ['hellopablo', '233585'],
  ];
  for (const email of BLOCKED_EMAILS) {
    if (allowlistedAuthorEmails().has(email)) {
      throw new Error(`check-neutral self-test allowlist contains a blocked address`);
    }
  }
  let allowed = '';
  for (const [login, id] of seeded) {
    const entry = TEAM_NOREPLY.find((row) => row.login === login && String(row.id) === id);
    if (!entry) throw new Error(`check-neutral self-test allowlist: missing ${id}+${login}`);
    const address = teamNoreplyAddress(entry);
    if (!allowed) allowed = address;
    assertCase(`allowlisted ${login}`, identityHits('c', address, address), false);
    assertCase(`allowlisted ${login} web merge`, identityHits('c', address, 'noreply@github.com'), false);
  }
  assertCase('blocked noreply author', identityHits('c', 'noreply@users.noreply.github.com', allowed), true);
  assertCase('blocked build author', identityHits('c', 'neat-os-build@users.noreply.github.com', allowed), true);
  assertCase('blocked noreply committer', identityHits('c', allowed, 'noreply@users.noreply.github.com'), true);
  assertCase('blocked build committer', identityHits('c', allowed, 'NEAT-OS-BUILD@users.noreply.github.com'), true);
  assertCase('cursor agent author', identityHits('c', 'cursoragent@cursor.com', allowed), true);
  assertCase('cursor agent committer', identityHits('c', allowed, 'CursorAgent@cursor.com'), true);
  assertCase('login-only noreply', identityHits('c', 'shauunhimseelf@users.noreply.github.com', allowed), true);
  assertCase('unknown noreply author', identityHits('c', '1+other@users.noreply.github.com', allowed), true);
  assertCase('unknown noreply committer', identityHits('c', allowed, '1+other@users.noreply.github.com'), false);
  assertCase('other domain author', identityHits('c', 'dev@example.com', 'noreply@github.com'), false);
  assertCase('missing author email', identityHits('c', '', allowed), true);
  assertCase(
    'api shape allowlisted',
    hitsForCommit({
      sha: 'abcdef0',
      commit: {
        message: 'docs: record the rule (GH-38)\n',
        author: { email: allowed },
        committer: { email: allowed },
      },
    }),
    false,
  );
  assertCase(
    'api shape trailer',
    hitsForCommit({
      sha: 'abcdef1',
      commit: {
        message: 'docs: record the rule\n\nCo-authored-by: A <a@example.com>\n',
        author: { email: allowed },
        committer: { email: 'noreply@github.com' },
      },
    }),
    true,
  );
  assertCase(
    'api shape blocked',
    hitsForCommit({
      sha: 'abcdef2',
      commit: {
        message: 'chore: set the author\n',
        author: { email: 'noreply@users.noreply.github.com' },
        committer: { email: 'noreply@github.com' },
      },
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
In a GitHub Actions pull_request job, the body and the commits in that pull request are checked (message, author email, committer email). See conventions/attribution.md.
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
