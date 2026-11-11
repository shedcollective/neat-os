'use strict';

/**
 * Smoke for the cloud-agent-environment helpers.
 * Network probes of Docker Hub stay out of this check.
 * scripts/check runs skills/<name>/smoke.js when the file exists.
 */

const { execFileSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '../..');

function withCleanEnv() {
  const env = { ...process.env };
  delete env.NEAT_OS_ROOT;
  delete env.NEAT_OS_TICKET_PREFIX;
  delete env.NEAT_OS_JIRA_PREFIX;
  delete env.SHED_OS_ROOT;
  delete env.SHED_OS_TICKET_PREFIX;
  delete env.SHED_OS_JIRA_PREFIX;
  return env;
}

const helperDir = path.join(root, 'skills/cloud-agent-environment/scripts');
const templateDir = path.join(root, 'skills/cloud-agent-environment/templates');

function runHelper(script, args, opts = {}) {
  return execFileSync('bash', [script, ...args], {
    encoding: 'utf8',
    env: { ...withCleanEnv(), ...opts.env },
    cwd: opts.cwd,
  });
}

function failHelper(script, args, opts = {}) {
  try {
    const stdout = runHelper(script, args, opts);
    throw new Error(`expected non-zero from ${path.basename(script)} ${args.join(' ')} but got:\n${stdout}`);
  } catch (err) {
    if (err.status === undefined) throw err;
    return { status: err.status, stdout: err.stdout || '', stderr: err.stderr || '' };
  }
}

for (const script of fs.readdirSync(helperDir).concat(fs.readdirSync(templateDir))) {
  const dir = fs.existsSync(path.join(helperDir, script)) ? helperDir : templateDir;
  const full = path.join(dir, script);
  if (!script.endsWith('.sh')) continue;
  execFileSync('bash', ['-n', full]);
  const help = runHelper(full, ['--help']);
  if (!/Usage:/.test(help)) {
    throw new Error(`${script} --help must print Usage`);
  }
}

const environmentJson = JSON.parse(fs.readFileSync(path.join(templateDir, 'environment.json'), 'utf8'));
if (environmentJson.install !== 'bash .agents/scripts/setup.sh' || environmentJson.start !== 'bash .agents/scripts/start.sh') {
  throw new Error(`environment.json template must point install and start at .agents/scripts: ${JSON.stringify(environmentJson)}`);
}
if (environmentJson.$schema) {
  throw new Error('environment.json template must not set $schema');
}

const agentsSection = fs.readFileSync(path.join(templateDir, 'AGENTS.cloud-agents.md'), 'utf8');
if (!agentsSection.includes('COMPOSER_GITHUB_TOKEN') || !agentsSection.includes('{{service}}')) {
  throw new Error('AGENTS cloud-agents template must name the Composer secret and leave a service placeholder');
}

const resolvedHelpers = runHelper(path.join(templateDir, 'resolve-helper-dir.sh'), [root]).trim();
if (resolvedHelpers !== helperDir) {
  throw new Error(`resolve-helper-dir.sh must print this checkout's helper scripts, got ${resolvedHelpers}`);
}

const probe = failHelper(path.join(helperDir, 'probe-hosts.sh'), []);
if (probe.status !== 2) {
  throw new Error(`probe-hosts with no host must exit 2, got ${probe.status}`);
}
const blocked = failHelper(path.join(helperDir, 'probe-hosts.sh'), ['--timeout', '2', 'no-such-host.invalid']);
if (blocked.status !== 1 || !/host=no-such-host\.invalid dns=fail/.test(blocked.stdout)) {
  throw new Error(`probe-hosts must fail a name that does not resolve:\n${blocked.stdout}\n${blocked.stderr}`);
}
const localTls = failHelper(path.join(helperDir, 'probe-hosts.sh'), ['--timeout', '2', '127.0.0.1']);
if (localTls.status !== 1 || !/host=127\.0\.0\.1 dns=ok tls=fail/.test(localTls.stdout)) {
  throw new Error(`probe-hosts must report TLS failure for https://127.0.0.1:\n${localTls.stdout}\n${localTls.stderr}`);
}

const cleanLog = path.join(os.tmpdir(), `neat-os-guard-clean-${process.pid}.log`);
const cloneLog = path.join(os.tmpdir(), `neat-os-guard-clone-${process.pid}.log`);
fs.writeFileSync(cleanLog, '  - Installing example/pkg (1.0.0): Extracting archive\n');
fs.writeFileSync(cloneLog, '  - Installing example/pkg (1.0.0): Cloning abcdef\nNow trying to download from source\n');
const cleanScan = runHelper(path.join(helperDir, 'guard-no-source-fallback.sh'), ['--scan', cleanLog]);
if (!/no source clone/.test(cleanScan)) {
  throw new Error(`guard --scan must accept an archive install:\n${cleanScan}`);
}
const cloneScan = failHelper(path.join(helperDir, 'guard-no-source-fallback.sh'), ['--scan', cloneLog]);
if (cloneScan.status !== 1 || !/source clone detected/.test(cloneScan.stderr)) {
  throw new Error(`guard --scan must fail a clone log:\n${cloneScan.stdout}\n${cloneScan.stderr}`);
}
fs.rmSync(cleanLog, { force: true });
fs.rmSync(cloneLog, { force: true });

const sentinel = path.join(os.tmpdir(), `neat-os-guard-sentinel-${process.pid}`);
fs.rmSync(sentinel, { force: true });
const rejected = failHelper(
  path.join(helperDir, 'guard-no-source-fallback.sh'),
  ['--composer', '--', 'bash', '-c', 'echo ran > "$SENTINEL"', 'bash'],
  { env: { COMPOSER_GITHUB_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.sig', SENTINEL: sentinel, GITHUB_TOKEN: '' } },
);
if (rejected.status !== 1 || fs.existsSync(sentinel) || !/JWT/.test(rejected.stderr)) {
  throw new Error(`guard must reject a JWT before running the command:\n${rejected.stdout}\n${rejected.stderr}`);
}
const sameAsApp = failHelper(
  path.join(helperDir, 'guard-no-source-fallback.sh'),
  ['--composer', '--', 'bash', '-c', 'echo ran > "$SENTINEL"', 'bash'],
  { env: { COMPOSER_GITHUB_TOKEN: 'github_pat_exampletoken', GITHUB_TOKEN: 'github_pat_exampletoken', SENTINEL: sentinel } },
);
if (sameAsApp.status !== 1 || fs.existsSync(sentinel) || !/GITHUB_TOKEN/.test(sameAsApp.stderr)) {
  throw new Error(`guard must reject a token that matches GITHUB_TOKEN:\n${sameAsApp.stdout}\n${sameAsApp.stderr}`);
}
const archiveRun = runHelper(
  path.join(helperDir, 'guard-no-source-fallback.sh'),
  ['--', 'bash', '-c', 'echo "Extracting archive"'],
);
if (!/Extracting archive/.test(archiveRun)) {
  throw new Error(`guard must pass an archive install through:\n${archiveRun}`);
}
const cloneRun = failHelper(
  path.join(helperDir, 'guard-no-source-fallback.sh'),
  ['--', 'bash', '-c', 'echo ": Cloning abcdef"; exit 0'],
);
if (cloneRun.status !== 1) {
  throw new Error(`guard must fail a command that clones and exits 0, got ${cloneRun.status}`);
}

const lockParent = fs.mkdtempSync(path.join(os.tmpdir(), 'neat-os-lock-'));
try {
  const lock = path.join(lockParent, 'composer.lock');
  const stamp = path.join(lockParent, 'stamp');
  const marker = path.join(lockParent, 'marker');
  fs.writeFileSync(lock, '{"content-hash":"one"}\n');
  const install = path.join(helperDir, 'install-if-lockfile-changed.sh');
  const runInstall = (code) => runHelper(install, ['--stamp', stamp, '--lockfile', lock, '--', 'bash', '-c', `echo ran >> "$MARKER"; exit ${code}`], {
    env: { MARKER: marker },
  });
  runInstall(0);
  runInstall(0);
  let lines = fs.readFileSync(marker, 'utf8').trim().split('\n');
  if (lines.length !== 1) {
    throw new Error(`unchanged lockfile must skip the install, marker lines: ${lines.length}`);
  }
  fs.writeFileSync(lock, '{"content-hash":"two"}\n');
  const failed = failHelper(install, ['--stamp', stamp, '--lockfile', lock, '--', 'bash', '-c', 'echo ran >> "$MARKER"; exit 7'], {
    env: { MARKER: marker },
  });
  if (failed.status !== 7) {
    throw new Error(`failed install must keep its status, got ${failed.status}`);
  }
  runInstall(0);
  runInstall(0);
  lines = fs.readFileSync(marker, 'utf8').trim().split('\n');
  if (lines.length !== 3) {
    throw new Error(`a failed install must not update the stamp; expected 3 runs, got ${lines.length}`);
  }
  const missing = failHelper(install, ['--stamp', stamp, '--lockfile', path.join(lockParent, 'missing.lock'), '--', 'true']);
  if (missing.status !== 1) {
    throw new Error(`a missing lockfile must exit 1, got ${missing.status}`);
  }
} finally {
  fs.rmSync(lockParent, { recursive: true, force: true });
}

const healthPortFile = path.join(os.tmpdir(), `neat-os-health-ports-${process.pid}`);
fs.rmSync(healthPortFile, { force: true });
const healthChild = spawn(process.execPath, ['-e', `
const fs = require('fs');
const http = require('http');
const net = require('net');
const tcp = net.createServer((socket) => socket.end());
const web = http.createServer((req, res) => res.end('{"status":"yellow"}'));
tcp.listen(0, '127.0.0.1', () => {
  web.listen(0, '127.0.0.1', () => {
    fs.writeFileSync(process.argv[1], tcp.address().port + ' ' + web.address().port + '\\n');
  });
});
`, healthPortFile], { stdio: 'ignore' });
let healthPorts = '';
try {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline && !healthPorts) {
    if (fs.existsSync(healthPortFile)) {
      healthPorts = fs.readFileSync(healthPortFile, 'utf8').trim();
    } else {
      execFileSync('sleep', ['0.05']);
    }
  }
  if (!healthPorts) {
    throw new Error('health fixture did not listen');
  }
  const [tcpPort, httpPort] = healthPorts.trim().split(/\s+/);
  const tcpOk = runHelper(path.join(helperDir, 'wait-healthy.sh'), ['--timeout', '5', '--interval', '1', '--tcp', `127.0.0.1:${tcpPort}`]);
  if (!/healthy after=/.test(tcpOk)) {
    throw new Error(`wait-healthy --tcp should pass:\n${tcpOk}`);
  }
  const httpOk = runHelper(path.join(helperDir, 'wait-healthy.sh'), ['--timeout', '5', '--interval', '1', '--url', `http://127.0.0.1:${httpPort}/health`, '--expect-body', '"status":"(yellow|green)"']);
  if (!/healthy after=/.test(httpOk)) {
    throw new Error(`wait-healthy --url should pass:\n${httpOk}`);
  }
  const httpMiss = failHelper(path.join(helperDir, 'wait-healthy.sh'), ['--timeout', '2', '--interval', '1', '--url', `http://127.0.0.1:${httpPort}/health`, '--expect-body', 'not-this-body']);
  if (httpMiss.status !== 1) {
    throw new Error(`wait-healthy must fail when the body does not match, got ${httpMiss.status}`);
  }
  const closed = failHelper(path.join(helperDir, 'wait-healthy.sh'), ['--timeout', '2', '--interval', '1', '--tcp', '127.0.0.1:1']);
  if (closed.status !== 1 || !/not healthy/.test(closed.stderr)) {
    throw new Error(`wait-healthy must time out on a closed port:\n${closed.stdout}\n${closed.stderr}`);
  }
} finally {
  healthChild.kill();
  fs.rmSync(healthPortFile, { force: true });
}
console.log('cloud-agent-environment smoke OK');
