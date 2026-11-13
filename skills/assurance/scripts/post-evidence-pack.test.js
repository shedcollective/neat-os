'use strict';

const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { before, test } = require('node:test');
const assert = require('node:assert/strict');

const helper = require('./post-evidence-pack.js');

const SCRIPT = path.join(__dirname, 'post-evidence-pack.js');
const DOC = path.join(__dirname, 'post-evidence-pack.md');
const SHA = 'a'.repeat(40);
const OTHER_SHA = 'b'.repeat(40);
const PACK = '## Assurance evidence pack\n\nNoted.\n';
const TOKEN = 'ghs_mocktoken_visible_marker';
const APP_LOGIN = 'neat-assurance[bot]';

let pem;
let publicKey;
let keyMarker;

before(() => {
  const pair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });
  pem = pair.privateKey;
  publicKey = pair.publicKey;
  const lines = pem.trim().split('\n').filter((line) => !line.startsWith('-----'));
  keyMarker = lines[1];
  assert.equal(keyMarker.length, 64);
});

function oneLine(value) {
  const body = value
    .replace('-----BEGIN RSA PRIVATE KEY-----', '')
    .replace('-----END RSA PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  return `-----BEGIN RSA PRIVATE KEY-----${body}-----END RSA PRIVATE KEY-----`;
}

function spacedOneLine(value) {
  const body = value
    .replace('-----BEGIN RSA PRIVATE KEY-----', '')
    .replace('-----END RSA PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const chunks = body.match(/.{1,8}/g).join(' ');
  return `-----BEGIN RSA PRIVATE KEY----- ${chunks} -----END RSA PRIVATE KEY-----`;
}

function runCli(args, extraEnv) {
  const env = { ...process.env };
  delete env.NEAT_ASSURANCE_APP_PRIVATE_KEY;
  delete env.NEAT_ASSURANCE_API_BASE;
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SCRIPT, ...args], {
      env: { ...env, ...extraEnv },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (err) => {
      resolve({ status: 1, stdout, stderr: `${stderr}${err.message}\n` });
    });
    child.on('close', (status) => {
      resolve({ status, stdout, stderr });
    });
  });
}

function assertNoSecrets(result, extras) {
  const output = `${result.stdout}\n${result.stderr}`;
  const body = pem
    .replace('-----BEGIN RSA PRIVATE KEY-----', '')
    .replace('-----END RSA PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const secrets = [pem, oneLine(pem), keyMarker, body, TOKEN, ...(extras || [])];
  for (const secret of secrets) {
    assert.equal(output.includes(secret), false);
  }
  assert.equal(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/.test(output), false);
}

function decodeJwt(authorization) {
  assert.match(authorization, /^Bearer ey/);
  const token = authorization.slice('Bearer '.length);
  const parts = token.split('.');
  assert.equal(parts.length, 3);
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  assert.equal(header.alg, 'RS256');
  assert.equal(payload.iss, helper.APP_ID);
  const now = Math.floor(Date.now() / 1000);
  assert.ok(payload.iat <= now - 55);
  assert.ok(payload.iat >= now - 120);
  assert.equal(payload.exp - payload.iat, 600);
  const ok = crypto.verify(
    'RSA-SHA256',
    Buffer.from(`${parts[0]}.${parts[1]}`),
    publicKey,
    Buffer.from(parts[2], 'base64url'),
  );
  assert.equal(ok, true);
  return token;
}

function comment(id, login, body) {
  return { id, body, user: { login } };
}

function withMock(state, fn) {
  state.calls = [];
  state.jwts = [];
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (state.drop && url.pathname.includes('/access_tokens')) {
        req.destroy();
        return;
      }
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString('utf8');
      const body = raw ? JSON.parse(raw) : null;
      const authorization = req.headers.authorization || '';
      state.calls.push({ method: req.method, path: url.pathname, body, authorization });
      const send = (status, payload, headers) => {
        res.writeHead(status, { 'Content-Type': 'application/json', ...(headers || {}) });
        res.end(JSON.stringify(payload));
      };

      if (req.method === 'GET' && /^\/repos\/[^/]+\/[^/]+\/installation$/.test(url.pathname)) {
        state.jwts.push(decodeJwt(authorization));
        if (state.installationStatus) return send(state.installationStatus, state.installationBody || { message: 'Not Found' });
        return send(200, { id: state.installationId });
      }

      const tokenPath = url.pathname.match(/^\/app\/installations\/([^/]+)\/access_tokens$/);
      if (req.method === 'POST' && tokenPath) {
        state.jwts.push(decodeJwt(authorization));
        state.tokenInstallationId = tokenPath[1];
        if (state.tokenStatus) {
          return send(state.tokenStatus, {
            message: `denied ${authorization.slice('Bearer '.length)} ${keyMarker} ${TOKEN}`,
          });
        }
        assert.deepEqual(body, { repositories: [state.repoName] });
        return send(201, { token: TOKEN });
      }

      if (authorization !== `Bearer ${TOKEN}`) return send(401, { message: 'expected installation token' });

      if (req.method === 'GET' && /^\/repos\/[^/]+\/[^/]+\/pulls\/[^/]+$/.test(url.pathname)) {
        return send(state.pullStatus || 200, state.pullBody || { head: { sha: state.headSha } });
      }

      if (req.method === 'GET' && /^\/repos\/[^/]+\/[^/]+\/issues\/[^/]+\/comments$/.test(url.pathname)) {
        const page = Number(url.searchParams.get('page') || '1');
        const pageSize = state.pageSize || 100;
        const slice = state.comments.slice((page - 1) * pageSize, page * pageSize);
        const headers = {};
        if (page * pageSize < state.comments.length) {
          const host = req.headers.host;
          headers.Link = `<http://${host}${url.pathname}?page=${page + 1}&per_page=${pageSize}>; rel="next"`;
        }
        return send(200, slice, headers);
      }

      if (req.method === 'POST' && /^\/repos\/[^/]+\/[^/]+\/issues\/[^/]+\/comments$/.test(url.pathname)) {
        state.created = body;
        return send(201, { id: 501, body: body.body });
      }

      const update = url.pathname.match(/^\/repos\/[^/]+\/[^/]+\/issues\/comments\/([^/]+)$/);
      if (req.method === 'PATCH' && update) {
        state.updated = { id: update[1], body };
        return send(200, { id: Number(update[1]), body: body.body });
      }

      return send(404, { message: `no route ${req.method} ${url.pathname}` });
    } catch (err) {
      state.handlerError = err && err.name ? err.name : 'handler';
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'mock handler failed' }));
      }
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', async () => {
      const { port } = server.address();
      try {
        resolve(await fn(`http://127.0.0.1:${port}`));
      } catch (err) {
        reject(err);
      } finally {
        server.close();
      }
    });
  });
}

function writePack(text) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'neat-os-pack-'));
  const file = path.join(dir, 'pack.md');
  fs.writeFileSync(file, text);
  return { dir, file };
}

function cliArgs(file, sha) {
  return ['--repo', 'acme/demo', '--pr', '12', '--head-sha', sha || SHA, '--body-file', file];
}

function baseState(over) {
  return {
    installationId: 4242,
    repoName: 'demo',
    headSha: SHA,
    comments: [],
    ...over,
  };
}

test('rebuilds a PKCS#1 PEM from the normal form and the one-line form', () => {
  assert.equal(helper.rebuildPem(pem), pem);
  assert.equal(helper.rebuildPem(oneLine(pem)), pem);
  assert.equal(helper.rebuildPem(spacedOneLine(pem)), pem);
  const rebuilt = helper.rebuildPem(oneLine(pem)).trim().split('\n');
  assert.equal(rebuilt[0], '-----BEGIN RSA PRIVATE KEY-----');
  assert.equal(rebuilt[rebuilt.length - 1], '-----END RSA PRIVATE KEY-----');
  const bodyLines = rebuilt.slice(1, -1);
  for (const line of bodyLines.slice(0, -1)) assert.equal(line.length, 64);
  assert.ok(bodyLines[bodyLines.length - 1].length <= 64);
  const key = crypto.createPrivateKey(helper.rebuildPem(oneLine(pem)));
  const payload = Buffer.from('pack');
  const signature = crypto.sign('RSA-SHA256', payload, key);
  assert.equal(crypto.verify('RSA-SHA256', payload, publicKey, signature), true);
  assert.throws(
    () => helper.rebuildPem('-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----\n'),
    /PKCS#1/,
  );
});

test('mints an RS256 JWT with iat 60 seconds ago and exp 10 minutes after iat', () => {
  const now = 1700000000;
  const token = helper.mintAppJwt(pem, now);
  const [h, p, s] = token.split('.');
  const header = JSON.parse(Buffer.from(h, 'base64url').toString('utf8'));
  const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
  assert.equal(header.alg, 'RS256');
  assert.equal(payload.iat, now - 60);
  assert.equal(payload.exp, payload.iat + 600);
  assert.equal(payload.iss, '5428024');
  assert.equal(
    crypto.verify('RSA-SHA256', Buffer.from(`${h}.${p}`), publicKey, Buffer.from(s, 'base64url')),
    true,
  );
});

test('the usage doc names the command and exit code 3 and no App login', () => {
  const doc = fs.readFileSync(DOC, 'utf8');
  assert.match(doc, /post-evidence-pack\.js/);
  assert.match(doc, /\| 3 \|/);
  assert.match(doc, /NEAT_ASSURANCE_APP_PRIVATE_KEY/);
  assert.match(doc, /174165018/);
  assert.match(doc, /5428024/);
  assert.equal(doc.includes(APP_LOGIN), false);
  assert.equal(doc.includes('cursor[bot]'), false);
  assert.equal(doc.includes('\u2014'), false);
  assert.equal(helper.EXIT.superseded, 3);
  assert.equal(helper.APP_LOGIN, APP_LOGIN);
  assert.equal(helper.FALLBACK_INSTALLATION_ID, 174165018);
});

test('exit 2 when the key or the body file is missing, and does not call GitHub', async () => {
  const { dir, file } = writePack(PACK);
  const state = baseState();
  try {
    await withMock(state, async (origin) => {
      const missingKey = await runCli(cliArgs(file), { NEAT_ASSURANCE_API_BASE: origin });
      assert.equal(missingKey.status, 2);
      assert.match(missingKey.stderr, /NEAT_ASSURANCE_APP_PRIVATE_KEY is not set/);
      assert.equal(state.calls.length, 0);

      const missingFile = await runCli(cliArgs(path.join(dir, 'absent.md')), {
        NEAT_ASSURANCE_API_BASE: origin,
        NEAT_ASSURANCE_APP_PRIVATE_KEY: pem,
      });
      assert.equal(missingFile.status, 2);
      assert.match(missingFile.stderr, /--body-file not found/);
      assert.equal(state.calls.length, 0);
      assertNoSecrets(missingFile);
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('exit 3 when the head SHA does not match, and posts nothing', async () => {
  const { dir, file } = writePack(PACK);
  const state = baseState({
    headSha: OTHER_SHA,
    comments: [comment(9, APP_LOGIN, PACK)],
  });
  try {
    await withMock(state, async (origin) => {
      const result = await runCli(cliArgs(file, SHA.toUpperCase()), {
        NEAT_ASSURANCE_API_BASE: origin,
        NEAT_ASSURANCE_APP_PRIVATE_KEY: oneLine(pem),
      });
      assert.equal(result.status, 3, result.stderr);
      assert.equal(result.stdout, '');
      assert.match(result.stderr, /The run was superseded/);
      assert.match(result.stderr, /Nothing was posted/);
      assert.equal(state.created, undefined);
      assert.equal(state.updated, undefined);
      const methods = state.calls.map((call) => call.method);
      assert.equal(methods.includes('PATCH'), false);
      assert.equal(methods.lastIndexOf('POST') < methods.lastIndexOf('GET'), true);
      assertNoSecrets(result, state.jwts);
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('updates the App pack comment in place', async () => {
  const { dir, file } = writePack(PACK);
  const state = baseState({
    pageSize: 1,
    comments: [
      comment(11, APP_LOGIN, PACK),
      comment(10, 'other-author', PACK),
      comment(9, APP_LOGIN, `${PACK}older`),
      comment(8, APP_LOGIN, 'not a pack'),
    ],
  });
  try {
    await withMock(state, async (origin) => {
      const result = await runCli(cliArgs(file), {
        NEAT_ASSURANCE_API_BASE: origin,
        NEAT_ASSURANCE_APP_PRIVATE_KEY: pem,
      });
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /updated evidence pack comment on acme\/demo#12 \(comment 9\)/);
      assert.equal(state.created, undefined);
      assert.deepEqual(state.updated, { id: '9', body: { body: PACK } });
      const writeAt = state.calls.findIndex((call) => call.method === 'PATCH');
      assert.match(state.calls[writeAt - 1].path, /\/pulls\/12$/);
      assert.equal(state.tokenInstallationId, '4242');
      assertNoSecrets(result, state.jwts);
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('creates a pack comment when the App has not posted one', async () => {
  const { dir, file } = writePack(PACK);
  const state = baseState({
    comments: [comment(4, APP_LOGIN, 'a status note')],
  });
  try {
    await withMock(state, async (origin) => {
      const result = await runCli(['--repo=acme/demo', '--pr=12', `--head-sha=${SHA}`, `--body-file=${file}`], {
        NEAT_ASSURANCE_API_BASE: origin,
        NEAT_ASSURANCE_APP_PRIVATE_KEY: pem,
      });
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /created evidence pack comment on acme\/demo#12 \(comment 501\)/);
      assert.equal(state.updated, undefined);
      assert.deepEqual(state.created, { body: PACK });
      const writeAt = state.calls.findIndex((call) => call.method === 'POST' && call.path.endsWith('/comments'));
      assert.match(state.calls[writeAt - 1].path, /\/pulls\/12$/);
      assert.equal(result.stderr.includes('fallback'), false);
      assertNoSecrets(result, state.jwts);
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('does not edit a pack comment written by another author', async () => {
  const { dir, file } = writePack(PACK);
  const state = baseState({
    comments: [comment(6, 'other-author', PACK)],
  });
  try {
    await withMock(state, async (origin) => {
      const result = await runCli(cliArgs(file), {
        NEAT_ASSURANCE_API_BASE: origin,
        NEAT_ASSURANCE_APP_PRIVATE_KEY: spacedOneLine(pem),
      });
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /created evidence pack comment/);
      assert.equal(state.updated, undefined);
      assert.deepEqual(state.created, { body: PACK });
      assert.equal(
        state.calls.some((call) => call.method === 'PATCH'),
        false,
      );
      assertNoSecrets(result, state.jwts);
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('prints neither the key, the JWT, nor the installation token', async () => {
  const { dir, file } = writePack(PACK);
  const state = baseState({ tokenStatus: 403 });
  try {
    await withMock(state, async (origin) => {
      const result = await runCli(cliArgs(file), {
        NEAT_ASSURANCE_API_BASE: origin,
        NEAT_ASSURANCE_APP_PRIVATE_KEY: oneLine(pem),
      });
      assert.equal(result.status, 1);
      assert.equal(result.stdout, '');
      assert.match(result.stderr, /create installation token: GitHub returned 403/);
      assertNoSecrets(result, state.jwts);
      assert.equal(state.created, undefined);
      assert.equal(state.updated, undefined);
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('names the failing step on a 404 and on a network error', async () => {
  const { dir, file } = writePack(PACK);
  const missing = baseState({ pullStatus: 404, pullBody: { message: 'Not Found' } });
  const dropped = baseState({ drop: true });
  try {
    await withMock(missing, async (origin) => {
      const result = await runCli(cliArgs(file), {
        NEAT_ASSURANCE_API_BASE: origin,
        NEAT_ASSURANCE_APP_PRIVATE_KEY: pem,
      });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /read pull request head: GitHub returned 404/);
      assert.equal(result.stdout, '');
      assert.equal(missing.created, undefined);
      assertNoSecrets(result, missing.jwts);
    });
    await withMock(dropped, async (origin) => {
      const result = await runCli(cliArgs(file), {
        NEAT_ASSURANCE_API_BASE: origin,
        NEAT_ASSURANCE_APP_PRIVATE_KEY: pem,
      });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /create installation token: network error/);
      assert.equal(result.stdout, '');
      assertNoSecrets(result, dropped.jwts);
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('uses the fallback installation id when the lookup fails', async () => {
  const { dir, file } = writePack(PACK);
  const state = baseState({ installationStatus: 404, installationBody: { message: 'Not Found' } });
  try {
    await withMock(state, async (origin) => {
      const result = await runCli(cliArgs(file), {
        NEAT_ASSURANCE_API_BASE: origin,
        NEAT_ASSURANCE_APP_PRIVATE_KEY: pem,
      });
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stderr, /read installation: GitHub returned 404 \(Not Found\)/);
      assert.match(result.stderr, /Using fallback installation id 174165018/);
      assert.equal(state.tokenInstallationId, '174165018');
      assert.match(result.stdout, /created evidence pack comment/);
      assertNoSecrets(result, state.jwts);
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('--help exits 0 and documents exit code 3', async () => {
  const result = await runCli(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Exit codes:/);
  assert.match(result.stdout, /3 {2}The head SHA changed/);
  assert.equal(result.stdout.includes(APP_LOGIN), false);
});
