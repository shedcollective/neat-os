#!/usr/bin/env node
'use strict';

/**
 * Neutral-reference check (ADR-0016, ADR-0023). conventions/neutral-reference.md.
 *
 * Keeps Shed's business out of what this repository publishes. Scans the tree
 * and, on a pull_request event, the pull request title, the body, the branch
 * name, and the commit messages in that pull request only. It does not read
 * commit authors or committers, or commits outside the pull request range.
 * Not a policy entry: scripts/check-policy.js is capped at 10.
 *
 * Client, client company, and client project names come from the
 * NEAT_OS_PRIVATE_TERMS environment variable (an Actions secret), never from
 * the tree. No term, and no count of terms, is ever printed. Every hit is
 * redacted before it is printed.
 *
 * A mailbox in a commit message is not a hit, in the body or on a trailer
 * line. The mailbox pattern still applies to files, the pull request title,
 * the pull request body, and the branch name. Private terms and the other
 * generic patterns still apply to commit messages (conventions/neutral-reference.md).
 *
 * The platform wraps the pull request body in CURSOR_AGENT_PR_BODY_BEGIN / END
 * and appends a footer after the end marker. Only the text between the markers
 * is checked. A body without the markers is checked in full.
 *
 * This file holds the generic patterns, so only the private terms scan it.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const SELF = 'scripts/check-neutral.js';
const PHRASE_EXEMPT = new Set(['conventions/neutral-reference.md']);
const KEY_PREFIXES = new Set(['GH', 'ADR', 'ACME', 'TICKET']);
const PRIVATE_ENV = 'NEAT_OS_PRIVATE_TERMS';
const REDACTED = '<private>';

const BEGIN = '<!-- CURSOR_AGENT_PR_BODY_BEGIN -->';
const END = '<!-- CURSOR_AGENT_PR_BODY_END -->';

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// One term per line, and a line that starts with # is a comment. A term
// matches as a whole word in any case. Spaces, hyphens, and underscores in a
// term match any run of those characters, or none.
function parsePrivateTerms(raw) {
  const terms = [];
  for (const line of String(raw || '').split(/\r?\n/)) {
    const term = line.trim();
    if (!term || term.startsWith('#')) continue;
    const parts = term.split(/[\s_-]+/).filter(Boolean).map(escapeRegExp);
    if (!parts.length) continue;
    terms.push(new RegExp(`(?<![\\p{L}\\p{N}])${parts.join('[\\s_-]*')}(?![\\p{L}\\p{N}])`, 'iu'));
  }
  return terms;
}

const PRIVATE_TERMS = parsePrivateTerms(process.env[PRIVATE_ENV]);

function hasPrivateTerm(text, terms) {
  return terms.some((term) => term.test(text));
}

function redact(text, terms) {
  let out = String(text);
  for (const term of terms) out = out.replace(new RegExp(term.source, 'giu'), REDACTED);
  return out;
}

function privateHits(rel, text, terms) {
  const hits = [];
  if (!terms.length) return hits;
  String(text).split('\n').forEach((line, index) => {
    if (hasPrivateTerm(line, terms)) hits.push(`${redact(rel, terms)}:${index + 1} private term`);
  });
  return hits;
}

function pathHits(rel, terms) {
  return hasPrivateTerm(rel, terms) ? [`${redact(rel, terms)} private term in path`] : [];
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

function scan(rel, text, terms = PRIVATE_TERMS, options = {}) {
  const skipEmail = options.skipEmail === true;
  const emailOnly = options.emailOnly === true;
  const hits = privateHits(rel, text, terms);
  const phraseExempt = PHRASE_EXEMPT.has(rel);
  const lines = String(text).split('\n');
  lines.forEach((line, index) => {
    const lineNo = index + 1;
    const add = (rule) => {
      // Redact before slicing, so a cut cannot leave part of a term behind.
      const excerpt = redact(line.trim(), terms).slice(0, 180);
      hits.push(`${redact(`${rel}:${lineNo} ${rule}`, terms)}${excerpt ? `: ${excerpt}` : ''}`);
    };

    if (!skipEmail) {
      for (const match of line.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
        if (!emailAllowed(match[0])) add('email');
      }
    }
    // A branch slug is misread by the other generic patterns. Private terms
    // above, and the mailbox pattern, are the layers that apply to it.
    if (emailOnly) return;
    // A Slack id is an uppercase token that contains a digit. A word such as
    // CODEOWNERS or UNLICENSED is not one.
    if (/(?<![A-Za-z0-9])[CDUW](?=[A-Z0-9]*\d)[A-Z0-9]{8,11}(?![A-Za-z0-9])/.test(line)) add('slack id');
    // Any host under slack.com is a workspace, except Slack's public API docs.
    for (const match of line.matchAll(/(?<![A-Za-z0-9.-])((?:[A-Za-z0-9-]+\.)+slack\.com)(?![A-Za-z0-9-])/gi)) {
      if (match[1].toLowerCase() !== 'api.slack.com') add('slack link');
    }
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

function commitHits(item, terms = PRIVATE_TERMS) {
  const label = `commit ${(item.sha || '').slice(0, 7)}`;
  const message = (item.commit && item.commit.message) || '';
  return scan(label, message, terms, { skipEmail: true });
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

function treeHits(terms = PRIVATE_TERMS) {
  const hits = [];
  for (const file of walk(root)) {
    const rel = path.relative(root, file);
    hits.push(...pathHits(rel, terms));
    const data = fs.readFileSync(file);
    if (data.includes(0)) continue;
    const text = data.toString('utf8');
    hits.push(...(rel === SELF ? privateHits(rel, text, terms) : scan(rel, text, terms)));
  }
  return hits;
}

function nextLink(header) {
  if (!header) return '';
  const match = header.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : '';
}

async function pullRequestHits(terms = PRIVATE_TERMS) {
  if (process.env.GITHUB_EVENT_NAME !== 'pull_request') return [];
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) return [];
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const pr = event.pull_request;
  if (!pr) return [];

  // Slack ids, ticket keys, and chatter phrases misread a branch slug.
  // Private terms and the mailbox pattern still apply to it.
  const branch = (pr.head && pr.head.ref) || '';
  const hits = [
    ...scan('pull request title', pr.title || '', terms),
    ...scan('pull request body', authorBody(pr.body || ''), terms),
    ...scan('pull request branch', branch, terms, { emailOnly: true }),
  ];
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
    for (const item of data) hits.push(...commitHits(item, terms));
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
  // The generic cases run with no private terms, so the secret cannot change them.
  const none = [];
  assertCase('example mailbox', scan('t', 'write dev@example.com and a@example.org', none), false);
  assertCase('mailbox', scan('t', 'write dev@elsewhere.test', none), true);
  assertCase('git ssh', scan('t', 'git@github.com', none), false);
  assertCase('publisher scope and url host', scan('t', "path.join('@shedcollective', 'neat-os') and " + '${GH_TOKEN}@github.com', none), false);
  assertCase('people may be named', scan('t', 'Reviewed by @someone, @<login>, and a named person.', none), false);
  assertCase('allowed keys', scan('t', 'GH-42 ADR-0016 ACME-123 TICKET-99 acme-42', none), false);
  assertCase('ticket key', scan('t', 'see ZZ-99', none), true);
  assertCase('not a ticket key', scan('t', 'utf-8 psr-4 PSR-4 v0-1 feature/gh-19-v0-1-0-batch', none), false);
  assertCase('not a slack id', scan('t', 'CODEOWNERS UNLICENSED GITHUB_WORKSPACE CANDIDATE', none), false);
  assertCase('slack', scan('t', 'ping U0123456789', none), true);
  assertCase('slack link', scan('t', 'see https://acme.slack.com/archives/general', none), true);
  assertCase('slack app link', scan('t', 'open app.slack.com/client', none), true);
  assertCase('slack public docs', scan('t', 'https://api.slack.com/methods and https://slack.com/help', none), false);
  assertCase('atlassian', scan('t', 'https://acme.atlassian.net/browse/ACME-1', none), true);
  assertCase('phrases', scan('t', 'please ask me about my repo', none), true);
  assertCase('convention may name the phrase', scan('conventions/neutral-reference.md', 'Do not write ask me', none), false);
  assertCase(
    'commit trailer mailbox',
    commitHits({ sha: 'abcdef1', commit: { message: 'docs: record the rule (GH-38)\n\nCo-authored-by: Example Person <someone@realdomain.test>\n' } }, none),
    false,
  );
  assertCase(
    'commit body mailbox',
    commitHits({ sha: 'abcdef3', commit: { message: 'docs: record the rule (GH-38)\n\nWrite to someone@realdomain.test about the change.\n' } }, none),
    false,
  );
  assertCase('pull request body mailbox', scan('pull request body', 'Write to someone@realdomain.test about the change.', none), true);
  assertCase('pull request title mailbox', scan('pull request title', 'Note someone@realdomain.test', none), true);
  assertCase('branch mailbox', scan('pull request branch', 'feature/someone@realdomain.test', none, { emailOnly: true }), true);
  assertCase('branch slug is not a ticket key', scan('pull request branch', 'feature/zz-99-login', none, { emailOnly: true }), false);
  assertCase(
    'commit chatter',
    commitHits({ sha: 'abcdef4', commit: { message: 'docs: record the rule (GH-38)\n\nplease ask me\n' } }, none),
    true,
  );
  assertCase(
    'commit identity is not read',
    commitHits(
      {
        sha: 'abcdef0',
        commit: {
          message: 'docs: record the rule (GH-38)\n',
          author: { name: 'Example Developer', email: 'dev@elsewhere.test' },
          committer: { name: 'Example Bot', email: 'bot@elsewhere.test' },
        },
      },
      none,
    ),
    false,
  );
  const wrapped = `${BEGIN}\nACME-1 is fine\n${END}\nCo-authored-by: Bot <bot@elsewhere.test>\nplease ask me`;
  assertCase('platform footer', scan('pull request body', authorBody(wrapped), none), false);
  assertCase('unmarked body', scan('pull request body', authorBody('please ask me'), none), true);

  // A synthetic list. The real list is never in this file.
  const synthetic = parsePrivateTerms('# synthetic list for the self-test\nAcme\n\n  Example Project  \n');
  if (synthetic.length !== 2) throw new Error('check-neutral self-test: the synthetic list must parse to two terms');
  for (const text of ['Work for ACME this week', 'example-project', 'Example_Project', 'ExampleProject', 'example  project']) {
    assertCase(`private term in ${text}`, privateHits('t', text, synthetic), true);
  }
  for (const text of ['acmesite', 'theacme', 'examples projected']) {
    assertCase(`not a private term in ${text}`, privateHits('t', text, synthetic), false);
  }
  assertCase('no list, no private hit', privateHits('t', 'Acme', none), false);
  assertCase('private term in path', pathHits('docs/example-project/notes.md', synthetic), true);
  assertCase('private term in branch', privateHits('pull request branch', 'feature/acme-login-4600', synthetic), true);
  assertCase(
    'private term in commit',
    commitHits({ sha: 'abcdef2', commit: { message: 'docs: note the Example Project rollout (GH-38)\n' } }, synthetic),
    true,
  );
  assertCase(
    'private term on a trailer',
    commitHits({ sha: 'abcdef6', commit: { message: 'docs: record the rule (GH-38)\n\nCo-authored-by: Acme Person <a@example.com>\n' } }, synthetic),
    true,
  );
  const printed = [
    ...scan('docs/acme-notes.md', 'Acme wrote to dev@elsewhere.test', synthetic),
    ...pathHits('docs/example-project/notes.md', synthetic),
  ];
  if (printed.length !== 3 || printed.some((hit) => /acme|example[\s_-]*project/i.test(hit))) {
    throw new Error(`check-neutral self-test redaction: ${printed.join(' | ')}`);
  }
  const keyed = scan('t', 'see ZZ-99 for this', parsePrivateTerms('ZZ'));
  if (keyed.length !== 2 || keyed.some((hit) => /zz/i.test(hit))) {
    throw new Error(`check-neutral self-test redaction of a rule label: ${keyed.join(' | ')}`);
  }
}

function help() {
  console.log(`Usage: node scripts/check-neutral.js

Scans the repository for the neutral-reference rules in conventions/neutral-reference.md.
In a GitHub Actions pull_request job, the pull request title, the body, the branch name, and the commit messages in that pull request are checked too.
A mailbox in a commit message is not a hit. The mailbox pattern still applies to files, the title, the body, and the branch name.
Client, client company, and client project names are read from ${PRIVATE_ENV}, one term per line. They are never printed.
`);
}

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    help();
    return;
  }
  selfTest();
  const checked = PRIVATE_TERMS.length > 0;
  if (!checked && process.env.GITHUB_ACTIONS === 'true') {
    console.log(`::notice title=check-neutral::${PRIVATE_ENV} is not set, so private terms were not checked. Review covers them.`);
  }
  const hits = [...treeHits(), ...(await pullRequestHits())];
  if (hits.length) {
    console.error(`check-neutral: ${hits.length} hit(s)`);
    for (const hit of hits) console.error(`  ${hit}`);
    process.exit(1);
  }
  console.log(`check-neutral OK (private terms ${checked ? 'checked' : 'not set'})`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
