#!/usr/bin/env node
'use strict';

/**
 * Post or update the single assurance evidence pack comment on a pull request.
 * Steps, inputs, and exit codes: skills/assurance/scripts/post-evidence-pack.md
 *
 * Exit 0 comment written, 1 a named step failed, 2 bad input, 3 head SHA moved.
 */

const crypto = require('crypto');
const fs = require('fs');

const APP_ID = '5428024';
const FALLBACK_INSTALLATION_ID = 174165018;
const APP_LOGIN = 'neat-assurance[bot]';
const PACK_HEADING = '## Assurance evidence pack';
const BEGIN = '-----BEGIN RSA PRIVATE KEY-----';
const END = '-----END RSA PRIVATE KEY-----';
const EXIT = { ok: 0, fail: 1, usage: 2, superseded: 3 };

let redactions = [];

class UsageError extends Error {
  constructor(detail) {
    super(detail);
    this.exitCode = EXIT.usage;
  }
}

class StepError extends Error {
  constructor(step, detail) {
    super(`${step}: ${detail}`);
    this.step = step;
    this.detail = detail;
    this.exitCode = EXIT.fail;
  }
}

class SupersededError extends Error {
  constructor(expected, current) {
    super(
      `head SHA mismatch: expected ${expected}, current ${current}. The run was superseded. Nothing was posted.`,
    );
    this.exitCode = EXIT.superseded;
  }
}

function resetRedactions() {
  redactions = [];
}

function remember(value) {
  const text = String(value || '');
  if (text.length < 12) return;
  redactions.push(text);
  for (const line of text.split(/[\r\n]+/)) {
    const trimmed = line.trim();
    if (trimmed.length >= 20 && !trimmed.startsWith('-----')) redactions.push(trimmed);
  }
}

function scrub(text) {
  let out = String(text);
  const unique = [...new Set(redactions)].sort((a, b) => b.length - a.length);
  for (const secret of unique) {
    if (secret.length >= 12) out = out.split(secret).join('[redacted]');
  }
  out = out.replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[redacted]');
  out = out.replace(/\bgh[opurs]_[A-Za-z0-9_]{8,}\b/g, '[redacted]');
  out = out.replace(/-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g, '[redacted]');
  return out;
}

function usage() {
  return `Usage: node skills/assurance/scripts/post-evidence-pack.js --repo <owner>/<name> --pr <number> --head-sha <sha> --body-file <path>

Create or update the single "## Assurance evidence pack" comment on a pull request
as the assurance GitHub App.

The private key is read from NEAT_ASSURANCE_APP_PRIVATE_KEY. It is a PKCS#1 RSA key
(BEGIN RSA PRIVATE KEY). A normal PEM and a one-line PEM both work. The command
rebuilds the PEM, mints an RS256 App JWT, and exchanges it for an installation
token scoped to that one repository.

Options:
  --repo <owner>/<name>   Repository to comment on
  --pr <number>           Pull request number
  --head-sha <sha>        40-character head SHA this run assured
  --body-file <path>      File that holds the comment body
  -h, --help              Show this help

Exit codes:
  0  The comment was created or updated
  1  A step failed (the message names the step)
  2  The arguments, the key, or the body file cannot be used
  3  The head SHA changed. Nothing was posted

Leave NEAT_ASSURANCE_API_BASE unset. Tests point it at a local mock.
The full steps are in skills/assurance/scripts/post-evidence-pack.md.
`;
}

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
      continue;
    }
    const eq = /^--([a-z0-9-]+)=(.*)$/.exec(arg);
    if (eq) {
      opts[eq[1]] = eq[2];
      continue;
    }
    const flag = /^--([a-z0-9-]+)$/.exec(arg);
    if (!flag) throw new UsageError(`unknown argument ${arg}`);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) throw new UsageError(`${arg} needs a value`);
    opts[flag[1]] = value;
    i += 1;
  }
  const known = new Set(['repo', 'pr', 'head-sha', 'body-file', 'help']);
  for (const key of Object.keys(opts)) {
    if (!known.has(key)) throw new UsageError(`unknown option --${key}`);
  }
  return opts;
}

function parseRepo(value) {
  const match = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(value || '');
  if (!match || match[1] === '.' || match[1] === '..' || match[2] === '.' || match[2] === '..') {
    throw new UsageError('--repo must be owner/name');
  }
  return { owner: match[1], name: match[2] };
}

function parsePr(value) {
  if (!/^[1-9][0-9]*$/.test(value || '')) throw new UsageError('--pr must be a positive integer');
  return value;
}

function parseSha(value) {
  if (!/^[0-9a-fA-F]{40}$/.test(value || '')) {
    throw new UsageError('--head-sha must be a 40-character hexadecimal SHA');
  }
  return value;
}

function readBody(file) {
  if (!file || file === '-') throw new UsageError('--body-file must be a path');
  let text;
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile()) throw new UsageError('--body-file must be a file');
    text = fs.readFileSync(file, 'utf8');
  } catch (err) {
    if (err instanceof UsageError) throw err;
    if (err && err.code === 'ENOENT') throw new UsageError(`--body-file not found: ${file}`);
    throw new UsageError('--body-file could not be read');
  }
  if (text.length === 0) throw new UsageError('--body-file is empty');
  return text;
}

function apiOrigin(raw) {
  const value = raw || 'https://api.github.com';
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new UsageError('NEAT_ASSURANCE_API_BASE is not a URL');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new UsageError('NEAT_ASSURANCE_API_BASE must be an http or https URL');
  }
  if (url.protocol === 'http:' && url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') {
    throw new UsageError('NEAT_ASSURANCE_API_BASE may use http only for 127.0.0.1 or localhost');
  }
  if (url.username || url.password) throw new UsageError('NEAT_ASSURANCE_API_BASE must not include credentials');
  if (url.pathname !== '/' && url.pathname !== '') {
    throw new UsageError('NEAT_ASSURANCE_API_BASE must be an origin');
  }
  return url.origin;
}

function rebuildPem(raw) {
  const text = String(raw || '').replace(/^\uFEFF/, '').trim();
  const beginAt = text.indexOf(BEGIN);
  const endAt = text.indexOf(END);
  if (beginAt === -1 || endAt === -1 || endAt <= beginAt) {
    throw new UsageError('private key must be a PKCS#1 RSA key (BEGIN RSA PRIVATE KEY)');
  }
  const body = text.slice(beginAt + BEGIN.length, endAt).replace(/\s+/g, '');
  if (!body || !/^[A-Za-z0-9+/]+={0,2}$/.test(body)) {
    throw new UsageError('private key body is not base64');
  }
  const lines = [];
  for (let i = 0; i < body.length; i += 64) lines.push(body.slice(i, i + 64));
  return `${BEGIN}\n${lines.join('\n')}\n${END}\n`;
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function mintAppJwt(pem, nowSeconds) {
  const now = Math.floor(Number(nowSeconds));
  if (!Number.isFinite(now)) throw new UsageError('mint app jwt: the clock value is not usable');
  const iat = now - 60;
  const exp = iat + 600;
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ iat, exp, iss: APP_ID }));
  const signingInput = `${header}.${payload}`;
  let signature;
  try {
    signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), pem);
  } catch (err) {
    const code = err && err.code ? ` (${err.code})` : '';
    throw new UsageError(`mint app jwt: the private key could not sign${code}`);
  }
  return `${signingInput}.${signature.toString('base64url')}`;
}

function githubMessage(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return '';
  }
  if (!parsed || typeof parsed.message !== 'string') return '';
  const cleaned = scrub(parsed.message).replace(/\s+/g, ' ').trim();
  if (!cleaned || cleaned === '[redacted]') return '';
  return cleaned.slice(0, 120);
}

function networkDetail(err) {
  if (err && /redirect/i.test(String(err.message))) return 'network error: unexpected redirect';
  const code = err && err.cause && err.cause.code;
  if (code) return `network error (${code})`;
  return 'network error';
}

async function request({ step, method, url, token, json }) {
  let response;
  try {
    response = await fetch(url, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(20000),
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'neat-os-post-evidence-pack',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(json ? { 'Content-Type': 'application/json' } : {}),
      },
      body: json ? JSON.stringify(json) : undefined,
    });
  } catch (err) {
    const detail = err && err.name === 'TimeoutError' ? 'network error: timed out' : networkDetail(err);
    throw new StepError(step, detail);
  }
  const text = await response.text();
  if (!response.ok) {
    const message = githubMessage(text);
    const extra = message ? ` (${message})` : '';
    throw new StepError(step, `GitHub returned ${response.status}${extra}`);
  }
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new StepError(step, 'GitHub returned a response that is not JSON');
    }
  }
  return { data, link: response.headers.get('link') };
}

function nextLink(header) {
  if (!header) return '';
  const match = String(header).match(/<([^>]+)>;\s*rel="next"/);
  if (!match || !/^https?:\/\//i.test(match[1])) return '';
  return match[1];
}

function warn(step, detail) {
  process.stderr.write(`post-evidence-pack: ${scrub(`${step}: ${detail}`)}\n`);
}

async function readInstallationId(origin, repo, jwt) {
  try {
    const found = await request({
      step: 'read installation',
      method: 'GET',
      url: `${origin}/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}/installation`,
      token: jwt,
    });
    const id = found.data && found.data.id;
    if (!Number.isInteger(id) || id <= 0) {
      throw new StepError('read installation', 'the response did not include an installation id');
    }
    return id;
  } catch (err) {
    if (!err.step) throw err;
    warn('read installation', `${err.detail}. Using fallback installation id ${FALLBACK_INSTALLATION_ID}.`);
    return FALLBACK_INSTALLATION_ID;
  }
}

async function listComments(origin, repo, pr, token) {
  const comments = [];
  let url = `${origin}/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}/issues/${pr}/comments?per_page=100`;
  for (let page = 0; page < 20; page += 1) {
    const res = await request({ step: 'list pull request comments', method: 'GET', url, token });
    if (!Array.isArray(res.data)) {
      throw new StepError('list pull request comments', 'GitHub returned a response that is not a list');
    }
    comments.push(...res.data);
    const follow = nextLink(res.link);
    if (!follow) return comments;
    url = follow;
  }
  throw new StepError('list pull request comments', 'stopped after 20 pages of comments');
}

function existingPack(comments) {
  let chosen = null;
  for (const comment of comments) {
    if (!comment || typeof comment.id !== 'number') continue;
    if (!comment.user || comment.user.login !== APP_LOGIN) continue;
    if (typeof comment.body !== 'string' || !comment.body.startsWith(PACK_HEADING)) continue;
    if (!chosen || comment.id < chosen.id) chosen = comment;
  }
  return chosen;
}

async function postPack({ repo, pr, headSha, body, privateKey, apiBase, nowSeconds }) {
  const pem = rebuildPem(privateKey);
  remember(privateKey);
  remember(pem);
  const jwt = mintAppJwt(pem, nowSeconds);
  remember(jwt);
  const origin = apiOrigin(apiBase);
  const installationId = await readInstallationId(origin, repo, jwt);
  const tokenRes = await request({
    step: 'create installation token',
    method: 'POST',
    url: `${origin}/app/installations/${installationId}/access_tokens`,
    token: jwt,
    json: { repositories: [repo.name] },
  });
  const installationToken = tokenRes.data && tokenRes.data.token;
  if (typeof installationToken !== 'string' || installationToken.length === 0) {
    throw new StepError('create installation token', 'the response did not include a token');
  }
  remember(installationToken);

  const repoPath = `${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`;
  const comments = await listComments(origin, repo, pr, installationToken);
  const pull = await request({
    step: 'read pull request head',
    method: 'GET',
    url: `${origin}/repos/${repoPath}/pulls/${pr}`,
    token: installationToken,
  });
  const current = pull.data && pull.data.head && pull.data.head.sha;
  if (typeof current !== 'string' || current.length === 0) {
    throw new StepError('read pull request head', 'the response did not include head.sha');
  }
  if (current.toLowerCase() !== headSha.toLowerCase()) throw new SupersededError(headSha, current);

  const pack = existingPack(comments);
  if (pack) {
    const updated = await request({
      step: 'update evidence pack comment',
      method: 'PATCH',
      url: `${origin}/repos/${repoPath}/issues/comments/${pack.id}`,
      token: installationToken,
      json: { body },
    });
    return { action: 'updated', commentId: updated.data && updated.data.id };
  }
  const created = await request({
    step: 'create evidence pack comment',
    method: 'POST',
    url: `${origin}/repos/${repoPath}/issues/${pr}/comments`,
    token: installationToken,
    json: { body },
  });
  return { action: 'created', commentId: created.data && created.data.id };
}

function requireOpt(opts, key) {
  if (!opts[key]) throw new UsageError(`missing --${key}`);
}

async function main(argv, env) {
  resetRedactions();
  try {
    const opts = parseArgs(argv);
    if (opts.help) {
      process.stdout.write(usage());
      return EXIT.ok;
    }
    requireOpt(opts, 'repo');
    requireOpt(opts, 'pr');
    requireOpt(opts, 'head-sha');
    requireOpt(opts, 'body-file');
    const repo = parseRepo(opts.repo);
    const pr = parsePr(opts.pr);
    const headSha = parseSha(opts['head-sha']);
    const body = readBody(opts['body-file']);
    const privateKey = env.NEAT_ASSURANCE_APP_PRIVATE_KEY;
    if (!privateKey || !String(privateKey).trim()) {
      throw new UsageError('NEAT_ASSURANCE_APP_PRIVATE_KEY is not set');
    }
    const result = await postPack({
      repo,
      pr,
      headSha,
      body,
      privateKey,
      apiBase: env.NEAT_ASSURANCE_API_BASE,
      nowSeconds: Math.floor(Date.now() / 1000),
    });
    const suffix = result.commentId ? ` (comment ${result.commentId})` : '';
    process.stdout.write(
      `${result.action} evidence pack comment on ${repo.owner}/${repo.name}#${pr}${suffix}\n`,
    );
    return EXIT.ok;
  } catch (err) {
    const code = err && err.exitCode ? err.exitCode : EXIT.fail;
    const message = err && err.message ? err.message : 'unknown error';
    process.stderr.write(`post-evidence-pack: ${scrub(message)}\n`);
    return code;
  }
}

if (require.main === module) {
  main(process.argv.slice(2), process.env).then(
    (code) => {
      process.exit(code);
    },
    () => {
      process.exit(EXIT.fail);
    },
  );
}

module.exports = {
  APP_ID,
  APP_LOGIN,
  EXIT,
  FALLBACK_INSTALLATION_ID,
  PACK_HEADING,
  mintAppJwt,
  rebuildPem,
};
