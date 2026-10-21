'use strict';

/**
 * gather: evidence passport from a target git repo.
 * Fills the IDE spread: AGENTS.md, .agents/README.md (Agent Guide),
 * and .agents/project.md from tree signals. When distinct surfaces are
 * evident (e.g. frontend + backend), also writes .agents/platforms/*
 * leaves and links them from AGENTS.md Platform leaves. When the tree's
 * frameworks match a stacks/<name>/ pack in neat-os, fills AGENTS.md
 * Stack packs with paths (never copies the pack).
 * Does not invent client facts. Does not copy company skills.
 * Does not overwrite a hand-written (non-template) .agents/README.md
 * unless --force. Init only copies unfilled templates — this script fills.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TICKET_TODO =
  'TODO / ask: ticket prefix (Jira key such as ACME, or GH for GitHub Issues; set NEAT_OS_TICKET_PREFIX or pass --ticket-prefix)';
// Older name, kept so existing callers and tests keep working.
const JIRA_TODO = TICKET_TODO;
const OS_REPO_TICKET = 'GH (GitHub Issues — OS repo, per neat-os conventions/tickets.md; not a gather question)';
const AWAITING_INTERVIEW = 'awaiting interview';

const SKIP_TOP = new Set([
  '.git',
  'node_modules',
  'vendor',
  '.idea',
  '.vscode',
  'coverage',
  'dist',
  'build',
  '.next',
  '.turbo',
]);

const COMPOSE_NAMES = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'];
const MAKE_NAMES = ['Makefile', 'makefile', 'GNUmakefile'];
const COMPOSE_META_KEYS = new Set([
  'image',
  'build',
  'ports',
  'volumes',
  'environment',
  'env_file',
  'command',
  'depends_on',
  'restart',
  'networks',
  'labels',
  'user',
  'working_dir',
  'entrypoint',
  'healthcheck',
  'profiles',
  'container_name',
  'expose',
  'hostname',
  'extra_hosts',
  'privileged',
  'stdin_open',
  'tty',
  'platform',
  'develop',
  'deploy',
  'secrets',
  'configs',
  'logging',
  'ulimits',
  'pull_policy',
  'init',
  'tmpfs',
]);

function usage() {
  return `Usage: light-scan.js [--force] [--ticket-prefix=KEY] [TARGET_DIR]

Scan TARGET_DIR (default: current git root) and write an evidence passport
into the IDE spread: AGENTS.md, .agents/README.md (Agent Guide), and
.agents/project.md (layout, Docker/Make, stack, CI, existing notes).
This is gather, not init. Does not invent client facts. Does not copy
company skills. Fills a missing/template Agent Guide; does not overwrite
a hand-written .agents/README.md or AGENTS.md unless --force.

Ticket prefix (Jira key for client repos, GH for GitHub Issues):
  --ticket-prefix=KEY      use this key (--jira-prefix is an alias)
  NEAT_OS_TICKET_PREFIX    env fallback (NEAT_OS_JIRA_PREFIX still honoured)
  SHED_OS_TICKET_PREFIX    deprecated fallback (SHED_OS_JIRA_PREFIX still honoured)
  OS repos                 neat-os and neat-os-tool-* get GH without asking; shed-os names still match
  otherwise                write: ${TICKET_TODO}
`;
}

const PREFIX_FLAGS = ['--ticket-prefix', '--jira-prefix'];

function ticketPrefixFromEnv(env = process.env) {
  if (env.NEAT_OS_TICKET_PREFIX) return env.NEAT_OS_TICKET_PREFIX;
  if (env.NEAT_OS_JIRA_PREFIX) return env.NEAT_OS_JIRA_PREFIX;
  if (env.SHED_OS_TICKET_PREFIX) {
    process.stderr.write('warning: SHED_OS_TICKET_PREFIX is deprecated; set NEAT_OS_TICKET_PREFIX\n');
    return env.SHED_OS_TICKET_PREFIX;
  }
  if (env.SHED_OS_JIRA_PREFIX) {
    process.stderr.write('warning: SHED_OS_JIRA_PREFIX is deprecated; set NEAT_OS_JIRA_PREFIX\n');
    return env.SHED_OS_JIRA_PREFIX;
  }
  return '';
}

function parseArgs(argv) {
  let force = false;
  let ticketPrefix = ticketPrefixFromEnv(process.env);
  let target = '';

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(usage());
      process.exit(0);
    }
    if (arg === '--force') {
      force = true;
      continue;
    }
    const flag = PREFIX_FLAGS.find((name) => arg === name || arg.startsWith(`${name}=`));
    if (flag) {
      if (arg === flag) {
        const next = argv[i + 1];
        if (!next || next.startsWith('-')) {
          throw new Error(`${flag} requires a value`);
        }
        ticketPrefix = next;
        i += 1;
      } else {
        ticketPrefix = arg.slice(flag.length + 1);
      }
      continue;
    }
    if (arg === '--') {
      continue;
    }
    if (arg.startsWith('-')) {
      throw new Error(`unknown option: ${arg}`);
    }
    if (target) {
      throw new Error(`unexpected argument: ${arg}`);
    }
    target = arg;
  }

  const prefix = String(ticketPrefix).trim();
  return { force, ticketPrefix: prefix, jiraPrefix: prefix, target };
}

function gitRoot(cwd) {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function exists(target, rel) {
  return fs.existsSync(path.join(target, rel));
}

function isDir(target, rel) {
  try {
    return fs.statSync(path.join(target, rel)).isDirectory();
  } catch {
    return false;
  }
}

function isFile(target, rel) {
  try {
    return fs.statSync(path.join(target, rel)).isFile();
  } catch {
    return false;
  }
}

function listDir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function isPlaceholder(value) {
  if (value == null) {
    return true;
  }
  const v = String(value).trim();
  if (!v || v === '-') {
    return true;
  }
  if (/^\{\{/.test(v)) {
    return true;
  }
  if (/^to confirm\b/i.test(v)) {
    return true;
  }
  if (/^TODO\b/i.test(v)) {
    return true;
  }
  if (/^ask:/i.test(v)) {
    return true;
  }
  if (/^awaiting interview\b/i.test(v)) {
    return true;
  }
  // Scan-written "no evidence" sentences must stay refillable on re-scan.
  if (/^none found in the tree/i.test(v) || /^No Makefile or Compose start path found/i.test(v)) {
    return true;
  }
  return false;
}

function composerPackages(composer) {
  const keys = [];
  for (const field of ['require', 'require-dev']) {
    if (composer[field] && typeof composer[field] === 'object') {
      keys.push(...Object.keys(composer[field]));
    }
  }
  return keys;
}

function packageDeps(pkg) {
  const keys = [];
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (pkg[field] && typeof pkg[field] === 'object') {
      keys.push(...Object.keys(pkg[field]));
    }
  }
  return keys;
}

function depVersion(obj, name) {
  if (!obj || typeof obj !== 'object') {
    return '';
  }
  for (const field of ['require', 'require-dev', 'dependencies', 'devDependencies']) {
    if (obj[field] && obj[field][name]) {
      return String(obj[field][name]);
    }
  }
  return '';
}

function hasNails(composerKeys, target) {
  if (composerKeys.some((key) => /(^|\/)nails(\/|$)/i.test(key) || /^nails\//i.test(key))) {
    return true;
  }
  return ['nails', 'vendor/nails', 'application/services/nails.php'].some((rel) => exists(target, rel));
}

function hasWordPress(composerKeys, target) {
  const composerHit = composerKeys.some((key) =>
    /wordpress|wpackagist|johnpbloch\/wordpress|roots\/wordpress/i.test(key),
  );
  if (composerHit) {
    return true;
  }
  return ['wp-content', 'wp-includes', 'wp-config.php', 'wp-settings.php'].some((rel) => exists(target, rel));
}

function hasLaravel(composerKeys, composer, target) {
  if (composerKeys.includes('laravel/framework') || exists(target, 'artisan')) {
    return true;
  }
  return Boolean(composer && composer.extra && composer.extra.laravel);
}

function detectNodeFrameworks(pkg, target) {
  const deps = packageDeps(pkg || {});
  const found = [];
  const map = [
    ['next', 'Next.js'],
    ['nuxt', 'Nuxt'],
    ['@angular/core', 'Angular'],
    ['react', 'React'],
    ['vue', 'Vue'],
    ['svelte', 'Svelte'],
    ['express', 'Express'],
    ['fastify', 'Fastify'],
  ];
  for (const [name, label] of map) {
    if (deps.includes(name)) {
      const ver = depVersion(pkg, name);
      found.push(ver ? `${label} ${ver}` : label);
    }
  }
  if (deps.includes('typescript') || exists(target, 'tsconfig.json')) {
    found.push('TypeScript');
  }
  return found;
}

function detectLockfilesAt(repoTarget, rel) {
  const prefix = rel === '.' ? '' : `${rel}/`;
  const locks = [];
  if (isFile(repoTarget, `${prefix}composer.lock`)) {
    locks.push(`${prefix}composer.lock (Composer)`);
  }
  if (isFile(repoTarget, `${prefix}composer.json`)) {
    locks.push(`${prefix}composer.json (Composer)`);
  }
  if (isFile(repoTarget, `${prefix}package.json`)) {
    locks.push(`${prefix}package.json (npm)`);
  }
  if (isFile(repoTarget, `${prefix}package-lock.json`)) {
    locks.push(`${prefix}package-lock.json (npm)`);
  }
  if (isFile(repoTarget, `${prefix}yarn.lock`)) {
    locks.push(`${prefix}yarn.lock (Yarn)`);
  }
  if (isFile(repoTarget, `${prefix}pnpm-lock.yaml`)) {
    locks.push(`${prefix}pnpm-lock.yaml (pnpm)`);
  }
  if (isFile(repoTarget, `${prefix}bun.lockb`) || isFile(repoTarget, `${prefix}bun.lock`)) {
    locks.push(`${prefix}bun.lock (Bun)`);
  }
  return unique(locks);
}

function detectLockfiles(target) {
  return detectLockfilesAt(target, '.');
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function findManifestRoots(target) {
  const roots = [];
  const seen = new Set();

  function add(rel, reason) {
    const key = rel === '.' ? '.' : rel.replace(/\\/g, '/').replace(/\/$/, '');
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    roots.push({ rel: key, reason });
  }

  if (
    isFile(target, 'composer.json') ||
    isFile(target, 'package.json') ||
    isFile(target, 'artisan') ||
    isDir(target, 'wp-content')
  ) {
    add('.', 'repo-root manifest');
  }

  for (const name of listDir(target).sort()) {
    if (SKIP_TOP.has(name)) {
      continue;
    }
    if (name.startsWith('.') && name !== '.agents') {
      continue;
    }
    if (!isDir(target, name)) {
      continue;
    }
    const hasComposer = isFile(target, path.join(name, 'composer.json'));
    const hasPkg = isFile(target, path.join(name, 'package.json'));
    const hasWp = isDir(target, path.join(name, 'wp-content')) || isFile(target, path.join(name, 'wp-config.php'));
    const hasArtisan = isFile(target, path.join(name, 'artisan'));
    if (hasComposer) {
      add(name, 'nested composer.json');
    } else if (hasPkg) {
      add(name, 'nested package.json');
    } else if (hasWp) {
      add(name, 'WordPress tree');
    } else if (hasArtisan) {
      add(name, 'artisan');
    }
  }

  return roots;
}

function scanManifestAt(repoTarget, rel) {
  const prefix = rel === '.' ? '' : `${rel}/`;
  const dir = rel === '.' ? repoTarget : path.join(repoTarget, rel);
  const composer = isFile(repoTarget, `${prefix}composer.json`)
    ? readJson(path.join(repoTarget, `${prefix}composer.json`))
    : null;
  const pkg = isFile(repoTarget, `${prefix}package.json`)
    ? readJson(path.join(repoTarget, `${prefix}package.json`))
    : null;
  const composerKeys = composer ? composerPackages(composer) : [];

  const languages = [];
  const frameworks = [];

  if (composer) {
    const phpVer = depVersion(composer, 'php');
    languages.push(phpVer ? `PHP ${phpVer}` : 'PHP');
  }
  if (pkg) {
    languages.push(pkg.type === 'module' ? 'JavaScript (ESM)' : 'JavaScript');
    frameworks.push(...detectNodeFrameworks(pkg, dir));
  }
  if (composer && hasLaravel(composerKeys, composer, dir)) {
    const ver = depVersion(composer, 'laravel/framework');
    frameworks.push(ver ? `Laravel ${ver}` : 'Laravel');
  }
  if (composer && hasNails(composerKeys, dir)) {
    frameworks.push('Nails');
  }
  if (hasWordPress(composerKeys, dir)) {
    frameworks.push('WordPress');
  }

  return {
    rel,
    prefix,
    reason: rel === '.' ? 'repo-root manifest' : 'nested app root',
    composer,
    pkg,
    languages: unique(languages),
    frameworks: unique(frameworks),
    lockfiles: detectLockfilesAt(repoTarget, rel),
  };
}

function detectDescription(parts) {
  const tidy = (text) => text.trim().replace(/\.+$/, '');
  for (const part of parts) {
    if (part.pkg && typeof part.pkg.description === 'string' && part.pkg.description.trim()) {
      const source = part.prefix ? `${part.prefix}package.json` : 'package.json';
      return { text: tidy(part.pkg.description), source };
    }
  }
  for (const part of parts) {
    if (part.composer && typeof part.composer.description === 'string' && part.composer.description.trim()) {
      const source = part.prefix ? `${part.prefix}composer.json` : 'composer.json';
      return { text: tidy(part.composer.description), source };
    }
  }
  return null;
}

// package.json scripts are start evidence for Node trees without Make/Compose.
function detectPackageScripts(parts) {
  const scripts = [];
  for (const part of parts || []) {
    const table = part.pkg && part.pkg.scripts;
    if (!table || typeof table !== 'object') {
      continue;
    }
    for (const [name, cmd] of Object.entries(table)) {
      if (typeof cmd !== 'string' || /^(pre|post)[a-z]/.test(name)) {
        continue;
      }
      const run = name === 'test' || name === 'start' ? `npm ${name}` : `npm run ${name}`;
      scripts.push({ name, run: part.prefix ? `${run} (in \`${part.rel}/\`)` : run, cmd: cmd.trim() });
    }
  }
  return scripts.slice(0, 8);
}

function formatScriptLine(script) {
  return `\`${script.run}\` — \`${script.cmd.replace(/`/g, "'")}\``;
}

function detectProjectName(target, parts) {
  for (const part of parts) {
    if (part.pkg && typeof part.pkg.name === 'string' && part.pkg.name.trim()) {
      return part.pkg.name.trim().replace(/^@[^/]+\//, '');
    }
  }
  for (const part of parts) {
    if (part.composer && typeof part.composer.name === 'string' && part.composer.name.trim()) {
      const chunks = part.composer.name.trim().split('/');
      return chunks[chunks.length - 1];
    }
  }
  return path.basename(target);
}

function detectStack(target) {
  const roots = findManifestRoots(target);
  const parts = (roots.length ? roots : [{ rel: '.', reason: 'repo-root' }]).map((root) =>
    scanManifestAt(target, root.rel),
  );
  const primary = parts[0] || scanManifestAt(target, '.');
  return {
    composer: primary.composer,
    pkg: primary.pkg,
    languages: unique(parts.flatMap((part) => part.languages)),
    frameworks: unique(parts.flatMap((part) => part.frameworks)),
    lockfiles: unique(parts.flatMap((part) => part.lockfiles)),
    ciHost: detectCi(target).lines,
    parts,
    roots,
  };
}

function parseComposeServices(text) {
  const services = [];
  const lines = String(text).split(/\r?\n/);
  let inServices = false;
  let serviceIndent = null;
  let current = null;

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '  ');
    if (!line.trim() || /^\s*#/.test(line)) {
      continue;
    }
    const indent = line.match(/^(\s*)/)[1].length;
    const keyMatch = line.match(/^(\s*)([A-Za-z0-9._-]+):\s*(.*)$/);

    if (!inServices) {
      if (/^services:\s*(#.*)?$/.test(line.trimEnd()) || /^services:\s*(#.*)?$/.test(line)) {
        inServices = true;
      }
      continue;
    }

    if (indent === 0 && keyMatch) {
      inServices = false;
      current = null;
      continue;
    }

    if (serviceIndent == null && indent > 0 && keyMatch) {
      serviceIndent = indent;
    }

    if (current && /^\s+-\s*['"]?(\d+(?::\d+){1,2})/.test(line)) {
      current.ports.push(line.match(/(\d+(?::\d+){1,2})/)[1]);
    }

    if (!keyMatch) {
      continue;
    }

    if (serviceIndent != null && indent === serviceIndent) {
      const name = keyMatch[2];
      if (COMPOSE_META_KEYS.has(name)) {
        continue;
      }
      current = { name, image: '', build: '', ports: [] };
      services.push(current);
      continue;
    }

    if (current && serviceIndent != null && indent > serviceIndent) {
      const key = keyMatch[2];
      const rest = keyMatch[3].trim().replace(/^['"]|['"]$/g, '');
      if (key === 'image' && rest) {
        current.image = rest;
      }
      if (key === 'build' && rest && rest !== '|' && rest !== '>' && rest !== '') {
        current.build = rest;
      }
    }
  }

  return services;
}

function parseDockerfileSummary(text) {
  const from = [];
  let workdir = '';
  const expose = [];
  for (const line of String(text).split(/\r?\n/)) {
    const fromMatch = line.match(/^\s*FROM\s+(\S+)/i);
    if (fromMatch) {
      from.push(fromMatch[1]);
    }
    const workMatch = line.match(/^\s*WORKDIR\s+(\S+)/i);
    if (workMatch) {
      workdir = workMatch[1];
    }
    const exposeMatch = line.match(/^\s*EXPOSE\s+(.+)/i);
    if (exposeMatch) {
      expose.push(exposeMatch[1].trim());
    }
  }
  return { from, workdir, expose };
}

function parseMakefileTargets(text) {
  const targets = [];
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line || /^\s/.test(line) || line.startsWith('#') || line.startsWith('.')) {
      continue;
    }
    if (/^(export|include|ifeq|ifneq|ifdef|ifndef|else|endif|define|endef|-include|sinclude)\b/.test(line)) {
      continue;
    }
    if (/^[A-Za-z_][A-Za-z0-9_]*\s*[+:?]?=/.test(line)) {
      continue;
    }
    const match = line.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)\s*:([^=].*)?$/);
    if (!match) {
      continue;
    }
    if (match[1] === 'PHONY' || match[1] === 'SUFFIXES' || match[1] === 'DEFAULT') {
      continue;
    }
    const recipes = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      if (lines[j].startsWith('\t')) {
        recipes.push(lines[j].replace(/^\t+/, '').replace(/^@/, '').trim());
      } else if (lines[j].trim() === '' || lines[j].startsWith('#')) {
        continue;
      } else {
        break;
      }
    }
    let comment = '';
    for (let k = i - 1; k >= 0; k -= 1) {
      if (lines[k].startsWith('#')) {
        comment = lines[k].replace(/^#\s*/, '').trim();
        break;
      }
      if (lines[k].trim() === '') {
        continue;
      }
      break;
    }
    targets.push({ name: match[1], recipes, comment });
  }
  return targets;
}

function parseGithubWorkflow(filename, text) {
  const nameMatch = String(text).match(/^name:\s*['"]?(.+?)['"]?\s*$/m);
  const name = nameMatch ? nameMatch[1].trim() : String(filename).replace(/\.(yml|yaml)$/i, '');
  const jobs = [];
  let inJobs = false;
  let jobsIndent = null;
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/\t/g, '  ');
    if (!line.trim() || /^\s*#/.test(line)) {
      continue;
    }
    if (!inJobs) {
      if (/^jobs:\s*(#.*)?$/.test(line)) {
        inJobs = true;
      }
      continue;
    }
    const indent = line.match(/^(\s*)/)[1].length;
    if (indent === 0) {
      break;
    }
    const key = line.match(/^(\s*)([A-Za-z0-9_-]+):\s*(#.*)?$/);
    if (!key) {
      continue;
    }
    if (jobsIndent == null) {
      jobsIndent = key[1].length;
    }
    if (key[1].length === jobsIndent) {
      jobs.push(key[2]);
    }
  }
  const blob = `${name} ${filename} ${jobs.join(' ')} ${text}`.toLowerCase();
  const imply = [];
  if (/lint|phpcs|eslint|prettier|phpstan|csfixer|pint/.test(blob)) {
    imply.push('lint');
  }
  if (/test|phpunit|pest|jest|vitest|playwright|cypress|phpstan/.test(blob)) {
    imply.push('tests');
  }
  if (/deploy|release|publish/.test(blob)) {
    imply.push('deploy');
  }
  if (/\bbuild\b/.test(blob)) {
    imply.push('build');
  }
  return { file: filename, name, jobs, imply: unique(imply) };
}

function detectDocker(target, manifestRoots) {
  const searchDirs = unique(['.', ...(manifestRoots || []).map((root) => root.rel).filter((rel) => rel !== '.'), 'docker']);
  const composeFiles = [];
  const dockerfiles = [];

  for (const dir of searchDirs) {
    if (dir !== '.' && !isDir(target, dir)) {
      continue;
    }
    for (const name of COMPOSE_NAMES) {
      const rel = dir === '.' ? name : path.join(dir, name);
      if (isFile(target, rel)) {
        composeFiles.push(rel.replace(/\\/g, '/'));
      }
    }
    const names = dir === '.' ? listDir(target) : listDir(path.join(target, dir));
    for (const name of names) {
      if (/^Dockerfile(\.|$)/i.test(name)) {
        const rel = dir === '.' ? name : path.join(dir, name);
        if (isFile(target, rel)) {
          dockerfiles.push(rel.replace(/\\/g, '/'));
        }
      }
    }
  }

  const services = [];
  for (const file of composeFiles) {
    const parsed = parseComposeServices(readText(path.join(target, file)));
    for (const service of parsed) {
      services.push({ ...service, file });
    }
  }

  const images = dockerfiles.map((file) => ({
    file,
    ...parseDockerfileSummary(readText(path.join(target, file))),
  }));

  return { composeFiles, dockerfiles, services, images };
}

function detectMake(target) {
  const files = MAKE_NAMES.filter((name) => isFile(target, name));
  const targets = [];
  for (const file of files) {
    for (const item of parseMakefileTargets(readText(path.join(target, file)))) {
      targets.push({ ...item, file });
    }
  }
  return { files, targets };
}

function formatWorkflows(workflows) {
  return workflows
    .map((wf) => {
      const jobs = wf.jobs.length ? `jobs: ${wf.jobs.join(', ')}` : 'jobs: (unnamed)';
      const imply = wf.imply.length ? ` — ${wf.imply.join(', ')}` : '';
      return `\`${wf.file}\` (name: ${wf.name}, ${jobs}${imply})`;
    })
    .join('; ');
}

function detectCi(target) {
  const workflows = [];
  const providers = [];
  const workflowsDir = path.join(target, '.github/workflows');
  if (isDir(target, '.github/workflows')) {
    const files = listDir(workflowsDir)
      .filter((name) => /\.(yml|yaml)$/i.test(name))
      .sort();
    for (const file of files.slice(0, 8)) {
      workflows.push(parseGithubWorkflow(file, readText(path.join(workflowsDir, file))));
    }
    if (workflows.length) {
      providers.push(`GitHub Actions: ${formatWorkflows(workflows)}`);
    } else {
      providers.push('GitHub Actions (no workflow YAML found)');
    }
  }
  if (isFile(target, '.gitlab-ci.yml')) {
    providers.push('GitLab CI (`.gitlab-ci.yml`)');
  }
  if (isFile(target, 'bitbucket-pipelines.yml')) {
    providers.push('Bitbucket Pipelines');
  }
  return { workflows, lines: providers, extraHost: detectHostHints(target) };
}

function detectHostHints(target) {
  const hints = [];
  if (isDir(target, '.deployhq') || isFile(target, 'deployhq.yml') || isFile(target, '.deployhq.yml')) {
    hints.push('DeployHQ config present (credentials / env mapping: gather — do not invent secrets)');
  }
  if (isFile(target, 'fly.toml')) {
    hints.push('fly.toml present (hosting to confirm)');
  }
  if (isFile(target, 'render.yaml')) {
    hints.push('render.yaml present (hosting to confirm)');
  }
  if (isFile(target, 'Procfile')) {
    hints.push('Procfile present (hosting to confirm)');
  }
  return hints;
}

function detectIntegrationBranch(target) {
  try {
    const head = execFileSync('git', ['-C', target, 'symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (head) {
      return { name: head.replace(/^origin\//, ''), source: 'origin/HEAD' };
    }
  } catch {
    // no origin/HEAD
  }

  let names = [];
  try {
    names = execFileSync('git', ['-C', target, 'for-each-ref', '--format=%(refname:short)', 'refs/heads', 'refs/remotes'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split('\n')
      .map((line) => line.replace(/^origin\//, '').trim())
      .filter(Boolean);
  } catch {
    names = [];
  }

  if (names.includes('develop')) {
    return { name: 'develop', source: 'local or remote branch' };
  }
  if (names.includes('main')) {
    return {
      name: 'main',
      source: 'local or remote branch',
      note: 'company default is develop (to confirm)',
    };
  }
  return { name: 'develop', source: 'company default (no branch signal)' };
}

function resolveConsumeScript(scriptDir) {
  const candidates = [];
  if (process.env.NEAT_OS_ROOT) {
    candidates.push(path.join(process.env.NEAT_OS_ROOT, 'skills/init/scripts/resolve-consume.sh'));
  }
  if (process.env.SHED_OS_ROOT) {
    candidates.push(path.join(process.env.SHED_OS_ROOT, 'skills/init/scripts/resolve-consume.sh'));
  }
  let dir = process.cwd();
  for (let i = 0; i < 12; i += 1) {
    candidates.push(
      path.join(dir, 'node_modules/@shedcollective/neat-os/skills/init/scripts/resolve-consume.sh'),
      path.join(dir, 'node_modules/@shedcollective/shed-os/skills/init/scripts/resolve-consume.sh'),
    );
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  candidates.push(
    path.join(scriptDir, 'resolve-consume.sh'),
    path.join(scriptDir, '../../init/scripts/resolve-consume.sh'),
  );
  return candidates.find((file) => fs.existsSync(file)) || '';
}

function detectConsumeMode(scriptDir, target) {
  const resolve = resolveConsumeScript(scriptDir);
  if (!resolve) {
    return { mode: 'unknown', raw: '' };
  }
  try {
    const raw = execFileSync('bash', [resolve, target], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const match = raw.match(/^mode:\s+(\S+)/m);
    return { mode: match ? match[1] : 'unknown', raw };
  } catch (err) {
    const raw = `${err.stdout || ''}${err.stderr || ''}`;
    const match = raw.match(/^mode:\s+(\S+)/m);
    return { mode: match ? match[1] : 'missing', raw };
  }
}

function markdownHeadings(text, limit = 6) {
  const headings = [];
  for (const line of String(text).split(/\r?\n/)) {
    const match = line.match(/^#{1,3}\s+(.+)/);
    if (match) {
      headings.push(match[1].trim());
    }
    if (headings.length >= limit) {
      break;
    }
  }
  return headings;
}

function isTemplateAgentsReadme(text) {
  const body = String(text || '');
  if (!body.trim()) {
    return true;
  }
  if (body.includes('Project facts only') && (body.includes('Do **not** copy neat-os') || body.includes('Do **not** copy shed-os'))) {
    return true;
  }
  if (/\{\{PROJECT_NAME\}\}/.test(body) || /\{\{one paragraph/.test(body)) {
    return true;
  }
  if (/## Critical Docker/.test(body) && /\{\{/.test(body)) {
    return true;
  }
  return false;
}

function isFillableAgentsReadme(text) {
  return isTemplateAgentsReadme(text);
}

function existingAgentsNotes(target) {
  const notes = [];
  const readmeRel = '.agents/README.md';
  if (isFile(target, readmeRel)) {
    const text = readText(path.join(target, readmeRel));
    const headings = markdownHeadings(text);
    const mentions = [];
    if (/\bdocker\b/i.test(text)) {
      mentions.push('Docker');
    }
    if (/\bmakefile\b|\bmake\s+[a-z0-9]/i.test(text)) {
      mentions.push('Make');
    }
    notes.push({
      path: readmeRel,
      kind: isFillableAgentsReadme(text) ? 'template-guide' : 'existing-ops',
      headings,
      mentions,
    });
  }

  const docsDir = path.join(target, '.agents/docs');
  if (fs.existsSync(docsDir)) {
    const docs = listDir(docsDir).filter((name) => name !== '.gitkeep' && !name.startsWith('.'));
    for (const name of docs.slice(0, 8)) {
      const rel = `.agents/docs/${name}`;
      notes.push({
        path: rel,
        kind: 'doc',
        headings: isFile(target, rel) ? markdownHeadings(readText(path.join(target, rel)), 2) : [],
        mentions: [],
      });
    }
  }

  const featuresDir = path.join(target, '.agents/features');
  if (fs.existsSync(featuresDir)) {
    const features = listDir(featuresDir).filter((name) => name !== 'TEMPLATE.md' && !name.startsWith('.'));
    for (const name of features.slice(0, 8)) {
      const rel = `.agents/features/${name}`;
      notes.push({
        path: rel,
        kind: 'feature',
        headings: isFile(target, rel) ? markdownHeadings(readText(path.join(target, rel)), 2) : [],
        mentions: [],
      });
    }
  }

  if (isFile(target, 'README.md')) {
    const text = readText(path.join(target, 'README.md'));
    notes.push({
      path: 'README.md',
      kind: 'readme',
      headings: markdownHeadings(text, 2),
      mentions: [],
    });
  }

  return notes;
}

function dirShape(target, rel, limit = 10) {
  const prefix = rel === '.' ? '' : `${rel}/`;
  const dir = rel === '.' ? target : path.join(target, rel);
  const items = [];
  for (const name of listDir(dir).sort()) {
    if (SKIP_TOP.has(name)) {
      continue;
    }
    if (name.startsWith('.') && name !== '.agents' && name !== '.github') {
      continue;
    }
    const childRel = `${prefix}${name}`;
    if (isDir(target, childRel)) {
      items.push(`${name}/`);
    } else if (
      isFile(target, childRel) &&
      /^(composer\.(json|lock)|package(-lock)?\.json|artisan|wp-config\.php|Makefile|docker-compose.+\.ya?ml|compose\.ya?ml)$/i.test(
        name,
      )
    ) {
      items.push(name);
    }
    if (items.length >= limit) {
      break;
    }
  }
  return items;
}

function notableRootFiles(target) {
  const names = [
    ...MAKE_NAMES,
    ...COMPOSE_NAMES,
    'Dockerfile',
    'composer.json',
    'package.json',
    'artisan',
    'wp-config.php',
  ];
  return names.filter((name) => isFile(target, name));
}

function preferredMakeTargets(targets) {
  const rank = [
    'up',
    'start',
    'down',
    'stop',
    'build',
    'shell',
    'bash',
    'ssh',
    'logs',
    'test',
    'composer',
    'npm',
    'yarn',
    'artisan',
    'wp',
    'migrate',
  ];
  const scored = targets.map((item, index) => {
    const rankAt = rank.indexOf(item.name);
    return { item, score: rankAt === -1 ? 100 + index : rankAt };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored.map((entry) => entry.item);
}

function stripRecipeNoise(recipe) {
  return String(recipe || '')
    .replace(/\s+#.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function recipeSummary(target) {
  const recipe = stripRecipeNoise((target.recipes || []).find(Boolean));
  if (recipe) {
    return recipe;
  }
  const comment = String(target.comment || '').trim();
  if (comment && comment.length <= 80 && !/^[-=*#._\s]+$/.test(comment)) {
    return comment;
  }
  return '(no recipe line)';
}

function formatMakeLine(targets) {
  if (!targets.length) {
    return 'none found in the tree';
  }
  const preferred = preferredMakeTargets(targets).slice(0, 10);
  return preferred
    .map((item) => `\`make ${item.name}\` — \`${recipeSummary(item).replace(/`/g, "'")}\``)
    .join('; ');
}

function formatComposeLine(docker) {
  if (!docker.composeFiles.length && !docker.dockerfiles.length) {
    return 'none found in the tree';
  }
  const bits = [];
  if (docker.composeFiles.length) {
    const names = unique(docker.services.map((service) => service.name));
    const ports = unique(docker.services.flatMap((service) => service.ports || []));
    bits.push(
      `${docker.composeFiles.map((file) => `\`${file}\``).join(', ')}` +
        (names.length ? ` services: ${names.map((name) => `\`${name}\``).join(', ')}` : '') +
        (ports.length ? ` (ports ${ports.join(', ')})` : ''),
    );
  }
  for (const image of docker.images.slice(0, 3)) {
    bits.push(
      `\`${image.file}\`` +
        (image.from.length ? ` FROM ${image.from.join(', ')}` : '') +
        (image.workdir ? ` WORKDIR ${image.workdir}` : ''),
    );
  }
  return bits.join('; ');
}

function appRootLine(parts, roots) {
  if (!parts.length) {
    return 'repo root (no nested composer/package manifest)';
  }
  return parts
    .map((part) => {
      const label = part.rel === '.' ? 'repo root' : `\`${part.rel}/\``;
      const why = (roots.find((root) => root.rel === part.rel) || {}).reason || part.reason;
      const stack = [...part.languages, ...part.frameworks].join(', ');
      return `${label} (${why}${stack ? `; ${stack}` : ''})`;
    })
    .join('; ');
}

function ciLineFromEvidence(ci) {
  const bits = [...ci.lines, ...ci.extraHost];
  if (!bits.length) {
    return 'CI / hosting vendor: to confirm (gather — no workflow or host manifest in the tree)';
  }
  if (!ci.extraHost.length) {
    bits.push('Hosting / deploy vendor: to confirm (gather; do not invent DeployHQ/secrets)');
  }
  return bits.join('. ');
}

function stackLine(scan) {
  const bits = [...scan.languages, ...scan.frameworks];
  return bits.length ? bits.join(', ') : '';
}

function lockLine(scan) {
  return scan.lockfiles.join(', ');
}

function hintForDir(dir, scan, docker, make, notes) {
  const name = String(dir).replace(/\/$/, '');
  if (name === 'app' && scan.frameworks.some((item) => /Laravel/.test(item))) {
    return 'Laravel application';
  }
  if (name === 'wp-content') {
    return 'WordPress content';
  }
  if (name === 'www') {
    return 'nested app root';
  }
  if (name === '.agents') {
    const ops = notes.find((note) => note.path === '.agents/README.md' && note.kind === 'existing-ops');
    return ops ? 'Agent Guide (existing, cited)' : 'Agent Guide + project slots';
  }
  if (name === '.github') {
    return 'CI / GitHub metadata';
  }
  if (name === 'src') {
    return 'source';
  }
  if (name === 'docker') {
    return 'container build context';
  }
  if (docker.composeFiles.includes(name)) {
    return 'Compose file';
  }
  return 'present';
}

function buildRepoStructure(target, scan, notes, docker, make) {
  const lines = [];
  const appRels = new Set((scan.parts || []).map((part) => part.rel).filter((rel) => rel !== '.'));

  for (const file of notableRootFiles(target)) {
    if (MAKE_NAMES.includes(file) && make.targets.length) {
      lines.push(`- \`${file}\` — targets: ${make.targets.map((item) => item.name).slice(0, 12).join(', ')}`);
    } else if (COMPOSE_NAMES.includes(file) && docker.services.length) {
      lines.push(
        `- \`${file}\` — Compose services: ${unique(docker.services.map((service) => service.name)).join(', ')}`,
      );
    } else if (/^Dockerfile/i.test(file) && docker.images.length) {
      const image = docker.images.find((item) => item.file === file);
      lines.push(`- \`${file}\` — ${image && image.from.length ? `FROM ${image.from.join(', ')}` : 'present'}`);
    } else {
      lines.push(`- \`${file}\` — present`);
    }
  }

  for (const dir of listDir(target).sort()) {
    if (SKIP_TOP.has(dir)) {
      continue;
    }
    if (dir.startsWith('.') && dir !== '.agents' && dir !== '.github') {
      continue;
    }
    if (!isDir(target, dir)) {
      continue;
    }
    const label = `${dir}/`;
    lines.push(`- \`${label}\` — ${hintForDir(label, scan, docker, make, notes)}`);
    if (appRels.has(dir)) {
      for (const child of dirShape(target, dir, 8)) {
        let childHint = 'present';
        if (child === 'wp-content/') {
          childHint = 'WordPress content';
        } else if (child === 'composer.json') {
          childHint = 'PHP deps';
        } else if (child === 'package.json') {
          childHint = 'Node deps';
        } else if (child === 'artisan') {
          childHint = 'Laravel CLI';
        }
        lines.push(`  - \`${child}\` — ${childHint}`);
      }
    }
  }

  for (const note of notes) {
    if (note.path === 'README.md' && note.kind === 'readme') {
      lines.push(`- \`README.md\` — present${note.headings[0] ? ` (“${note.headings[0]}”)` : ''}`);
    }
  }

  if (!lines.length) {
    return '- (passport: no notable top-level dirs beyond VCS noise)';
  }
  return unique(lines).join('\n');
}

function buildStartBrief(evidence) {
  const bits = [];
  const nested = (evidence.stack.parts || []).filter((part) => part.rel !== '.');
  if (nested.length) {
    bits.push(`app root ${nested.map((part) => `\`${part.rel}/\``).join(', ')}`);
  } else if (evidence.stack.frameworks.length || evidence.stack.languages.length) {
    bits.push(`repo-root ${evidence.stack.frameworks[0] || evidence.stack.languages[0]} tree`);
  }
  if (evidence.docker.services.length) {
    bits.push(
      `Docker Compose (${unique(evidence.docker.services.map((service) => `\`${service.name}\``)).join(', ')})`,
    );
  } else if (evidence.docker.composeFiles.length) {
    bits.push(`Docker Compose (\`${evidence.docker.composeFiles[0]}\`)`);
  }
  if (evidence.make.targets.length) {
    const names = preferredMakeTargets(evidence.make.targets)
      .slice(0, 4)
      .map((item) => `\`make ${item.name}\``);
    bits.push(`Makefile (${names.join(', ')})`);
  }
  const ops = evidence.notes.find((note) => note.kind === 'existing-ops');
  if (ops) {
    bits.push(`existing ops notes: \`${ops.path}\` (cited, not overwritten)`);
  }
  if (!bits.length) {
    return 'thin tree — gather for local commands and client brief';
  }
  return bits.join('; ');
}

function buildLocalSetup(evidence) {
  const lines = ['From repo evidence (not invented host docs):'];
  if (evidence.make.targets.length) {
    for (const item of preferredMakeTargets(evidence.make.targets).slice(0, 8)) {
      lines.push(`- \`make ${item.name}\` — \`${recipeSummary(item).replace(/`/g, "'")}\``);
    }
  } else if (evidence.docker.composeFiles.length) {
    const file = evidence.docker.composeFiles[0];
    lines.push(`- \`docker compose -f ${file} up -d\` — start Compose services`);
    lines.push(`- \`docker compose -f ${file} down\` — stop Compose services`);
  } else if (evidence.packageScripts && evidence.packageScripts.length) {
    for (const script of evidence.packageScripts) {
      lines.push(`- ${formatScriptLine(script)}`);
    }
    lines.push('- Host toolchain (Node version, package manager): to confirm (gather).');
  } else {
    lines.push('- No Makefile or Docker Compose start path found in the tree — local host commands: to confirm (gather).');
  }
  if (evidence.docker.services.length) {
    lines.push(
      `- Compose services: ${unique(evidence.docker.services.map((service) => `\`${service.name}\``)).join(', ')}` +
        ` (${evidence.docker.composeFiles.map((file) => `\`${file}\``).join(', ')})`,
    );
  }
  const ops = evidence.notes.find((note) => note.kind === 'existing-ops');
  if (ops) {
    lines.push(`- Existing ops guide: \`${ops.path}\` (cited, not overwritten).`);
  }
  return lines.join('\n');
}

function buildStackRules(evidence) {
  const lines = ['From repo evidence (not a client brief):'];
  const nested = (evidence.stack.parts || []).filter((part) => part.rel !== '.');
  if (nested.length) {
    lines.push(
      `- App lives under ${nested.map((part) => `\`${part.rel}/\``).join(', ')} — do not assume a repo-root Composer/npm SoT.`,
    );
  }
  if (evidence.docker.composeFiles.length || evidence.docker.dockerfiles.length) {
    lines.push('- Container-first: prefer Compose/Make targets over host PHP/Node unless gather confirms a host toolchain.');
  }
  if (evidence.make.targets.length) {
    lines.push(
      `- Task runner: \`${evidence.make.files[0]}\` (targets: ${evidence.make.targets
        .map((item) => item.name)
        .slice(0, 12)
        .join(', ')}).`,
    );
  }
  if (lines.length === 1) {
    lines.push('- No Docker/Make/nested-root rules found — stack rules: to confirm (gather).');
  }
  return lines.join('\n');
}

function buildGotchas(evidence) {
  const lines = [];
  const nested = (evidence.stack.parts || []).filter((part) => part.rel !== '.');
  if (nested.length) {
    const soT = nested
      .map((part) => (part.lockfiles[0] ? `\`${part.lockfiles[0].split(' ')[0]}\`` : `\`${part.rel}/\``))
      .join(', ');
    lines.push(`- Nested app root: package SoT is ${soT}, not necessarily the repo root.`);
  }
  if (evidence.make.targets.length && (evidence.docker.composeFiles.length || evidence.docker.dockerfiles.length)) {
    lines.push(
      '- Local commands appear Docker-wrapped via Make — prefer `make …` over host Composer/npm unless gather confirms otherwise.',
    );
  }
  const ops = evidence.notes.find((note) => note.kind === 'existing-ops');
  if (ops) {
    lines.push(`- \`${ops.path}\` is a hand-written ops guide; do not replace it without evidence.`);
  }
  lines.push('- More traps (WSL2 localhost, file-watchers, toolchain parity): to confirm (gather).');
  return lines.join('\n');
}

function buildProjectSpecific(evidence) {
  const nested = (evidence.stack.parts || []).filter((part) => part.rel !== '.');
  if (nested.length) {
    return `Nested app root ${nested
      .map((part) => `\`${part.rel}/\``)
      .join(', ')} is the application tree. Domain names / do-not-rename: to confirm (gather).`;
  }
  return '';
}

const FRONTEND_FRAMEWORK_RE = /^(React|Vue|Next\.js|Nuxt|Angular|Svelte)\b/i;
const BACKEND_FRAMEWORK_RE = /^(Laravel|Nails|WordPress|Express|Fastify)\b/i;
const FRONTEND_DIR_RE = /^(frontend|front-end|client|web|ui)$/i;
const BACKEND_DIR_RE = /^(backend|back-end|server|api)$/i;
const APP_DIR_RE = /^(app|mobile|ios|android)$/i;
const WEB_DIR_RE = /^(web|www|site)$/i;

function partHasFrontend(part) {
  if ((part.frameworks || []).some((item) => FRONTEND_FRAMEWORK_RE.test(item))) {
    return true;
  }
  if (FRONTEND_DIR_RE.test(part.rel || '')) {
    return true;
  }
  return false;
}

function partHasBackend(part) {
  if (part.composer) {
    return true;
  }
  if ((part.languages || []).some((item) => /\bPHP\b/i.test(item))) {
    return true;
  }
  if ((part.frameworks || []).some((item) => BACKEND_FRAMEWORK_RE.test(item))) {
    return true;
  }
  if (BACKEND_DIR_RE.test(part.rel || '')) {
    return true;
  }
  return false;
}

function namedSurfaceDirs(target) {
  const found = { frontend: false, backend: false, app: false, web: false };
  for (const name of listDir(target)) {
    if (!isDir(target, name)) {
      continue;
    }
    if (FRONTEND_DIR_RE.test(name)) {
      found.frontend = true;
    }
    if (BACKEND_DIR_RE.test(name)) {
      found.backend = true;
    }
    if (APP_DIR_RE.test(name) && name.toLowerCase() !== 'app') {
      found.app = true;
    } else if (/^(mobile|ios|android)$/i.test(name)) {
      found.app = true;
    }
    if (WEB_DIR_RE.test(name) && name.toLowerCase() !== 'www') {
      found.web = true;
    } else if (/^web$/i.test(name)) {
      found.web = true;
    }
  }
  return found;
}

function classifySurfaces(evidence, target) {
  const parts = evidence.stack.parts || [];
  let frontend = false;
  let backend = false;
  const frontendParts = [];
  const backendParts = [];

  for (const part of parts) {
    const fe = partHasFrontend(part);
    const be = partHasBackend(part);
    if (fe) {
      frontend = true;
      frontendParts.push(part);
    }
    if (be) {
      backend = true;
      backendParts.push(part);
    }
  }

  const named = namedSurfaceDirs(target);
  if (named.frontend) {
    frontend = true;
  }
  if (named.backend) {
    backend = true;
  }

  return {
    frontend,
    backend,
    app: named.app,
    web: named.web,
    frontendParts,
    backendParts,
    named,
  };
}

function decidePlatformLeaves(evidence, target) {
  const surfaces = classifySurfaces(evidence, target);
  const leaves = [];

  // Primary split: frontend + backend when both are evident.
  if (surfaces.frontend && surfaces.backend) {
    leaves.push({
      id: 'frontend',
      title: 'Frontend',
      parts: surfaces.frontendParts,
      kind: 'frontend',
    });
    leaves.push({
      id: 'backend',
      title: 'Backend',
      parts: surfaces.backendParts,
      kind: 'backend',
    });
  }

  // Secondary split: app vs web when both named dirs exist and we did not
  // already cover them as frontend/backend leaves with the same ids.
  if (surfaces.app && surfaces.web) {
    const ids = new Set(leaves.map((leaf) => leaf.id));
    if (!ids.has('app')) {
      leaves.push({ id: 'app', title: 'App', parts: [], kind: 'app' });
    }
    if (!ids.has('web')) {
      leaves.push({ id: 'web', title: 'Web', parts: [], kind: 'web' });
    }
  }

  return { surfaces, leaves };
}

const STACK_PACK_FRAMEWORKS = [
  { id: 'nails', title: 'Nails', re: /\bNails\b/i },
  { id: 'laravel', title: 'Laravel', re: /\bLaravel\b/i },
  { id: 'wordpress', title: 'WordPress', re: /\bWordPress\b/i },
];

function osRootFromThisPackage() {
  return path.resolve(__dirname, '../../..');
}

function listStackPackDocs(osRoot, packId) {
  const dir = path.join(osRoot, 'stacks', packId);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => `stacks/${packId}/${name}`);
}

function detectStackPacks(evidence, osRoot) {
  const root = osRoot || osRootFromThisPackage();
  const frameworks = unique([
    ...(evidence.stack.frameworks || []),
    ...((evidence.stack.parts || []).flatMap((part) => part.frameworks || [])),
  ]);
  const packs = [];
  for (const item of STACK_PACK_FRAMEWORKS) {
    if (!frameworks.some((name) => item.re.test(name))) {
      continue;
    }
    const files = listStackPackDocs(root, item.id);
    if (!files.length) {
      continue;
    }
    packs.push({ id: item.id, title: item.title, files });
  }
  return packs;
}

function buildStackPacksSection(packs) {
  if (!packs.length) {
    return `## Stack packs

None yet. \`gather\` points at \`stacks/<name>/\` in the resolved neat-os tree when the repo's frameworks match a pack that exists. Stack rules are read from neat-os. They are never copied into this repository.
`;
  }
  const blocks = packs.map((pack) => {
    const links = pack.files.map((rel) => `- \`${rel}\``).join('\n');
    return `**${pack.title}**

${links}`;
  });
  const matched = packs.map((pack) => `**${pack.title}**`).join(', ');
  return `## Stack packs

This tree matched ${matched}. Read these files from the resolved neat-os tree (same order as playbooks: \`NEAT_OS_ROOT\`, then \`node_modules/@shedcollective/neat-os\`, then sibling \`../neat-os\`). Do not copy them into this repository.

${blocks.join('\n\n')}
`;
}

function fillStackPacksSection(text, packs, force) {
  const block = buildStackPacksSection(packs);
  if (/^## Stack packs\b/m.test(text)) {
    return replaceSection(text, ['Stack packs'], block, force, () => true);
  }
  if (/^## Feature docs\b/m.test(text)) {
    return text.replace(/^## Feature docs\b/m, `${block}\n## Feature docs`);
  }
  if (/^## Gather next\b/m.test(text)) {
    return text.replace(/^## Gather next\b/m, `${block}\n## Gather next`);
  }
  return `${text.trimEnd()}\n\n${block}`;
}

function isFillablePlatformLeaf(text) {
  if (!text || !String(text).trim()) {
    return true;
  }
  if (/\{\{SURFACE\}\}/.test(text) || /\{\{PROJECT_NAME\}\}/.test(text)) {
    return true;
  }
  if (/Focused guide for the \*\*\{\{SURFACE\}\}\*\* surface/.test(text)) {
    return true;
  }
  // Evidence-written leaves always start with this marker comment line pattern
  // or the standard title; treat unknown hand-written content as non-fillable.
  if (/^# .+ — (Frontend|Backend|App|Web) leaf\b/m.test(text) && /Filled by `gather` from \*\*repo evidence\*\*/.test(text)) {
    return true;
  }
  return false;
}

function filterStackBits(languages, frameworks, kind) {
  const bits = [];
  if (kind === 'frontend') {
    bits.push(...(frameworks || []).filter((item) => FRONTEND_FRAMEWORK_RE.test(item)));
    bits.push(...(languages || []).filter((item) => /JavaScript|TypeScript/i.test(item)));
  } else if (kind === 'backend') {
    bits.push(...(languages || []).filter((item) => /\bPHP\b/i.test(item)));
    bits.push(...(frameworks || []).filter((item) => BACKEND_FRAMEWORK_RE.test(item)));
  } else {
    bits.push(...(languages || []), ...(frameworks || []));
  }
  return bits;
}

function surfaceStackLine(parts, kind, evidence) {
  const bits = [];
  for (const part of parts || []) {
    bits.push(...filterStackBits(part.languages, part.frameworks, kind));
  }
  if (!bits.length) {
    bits.push(...filterStackBits(evidence.stack.languages, evidence.stack.frameworks, kind));
  }
  return unique(bits).join(', ');
}

function surfaceLockLine(parts, kind, evidence) {
  const locks = [];
  const want =
    kind === 'frontend'
      ? /package|npm|yarn|pnpm|bun/i
      : kind === 'backend'
        ? /composer/i
        : /./;
  for (const part of parts || []) {
    locks.push(...(part.lockfiles || []).filter((item) => want.test(item)));
  }
  if (!locks.length) {
    locks.push(...(evidence.stack.lockfiles || []).filter((item) => want.test(item)));
  }
  return unique(locks).join(', ') || 'to confirm (gather)';
}

function surfaceLayoutLine(leaf, evidence, target) {
  const lines = [];
  const parts = leaf.parts || [];
  if (parts.length) {
    for (const part of parts) {
      const label = part.rel === '.' ? 'repo root' : `\`${part.rel}/\``;
      const stack = [...(part.languages || []), ...(part.frameworks || [])].join(', ');
      lines.push(`- ${label}${stack ? ` — ${stack}` : ''}`);
    }
  } else {
    for (const name of listDir(target).sort()) {
      if (!isDir(target, name)) {
        continue;
      }
      if (leaf.kind === 'frontend' && FRONTEND_DIR_RE.test(name)) {
        lines.push(`- \`${name}/\` — frontend tree`);
      }
      if (leaf.kind === 'backend' && BACKEND_DIR_RE.test(name)) {
        lines.push(`- \`${name}/\` — backend tree`);
      }
      if (leaf.kind === 'app' && /^(app|mobile|ios|android)$/i.test(name) && name.toLowerCase() !== 'app') {
        lines.push(`- \`${name}/\` — app tree`);
      }
      if (leaf.kind === 'app' && /^(mobile|ios|android)$/i.test(name)) {
        lines.push(`- \`${name}/\` — app tree`);
      }
      if (leaf.kind === 'web' && /^web$/i.test(name)) {
        lines.push(`- \`${name}/\` — web tree`);
      }
    }
  }
  if (!lines.length) {
    return `- ${leaf.title} paths: to confirm (gather — signals present but no dedicated directory).`;
  }
  return unique(lines).join('\n');
}

function surfaceSetupLine(leaf, evidence) {
  const lines = ['From repo evidence (surface-filtered where possible):'];
  if (leaf.kind === 'frontend') {
    const feLocks = (evidence.stack.lockfiles || []).filter((item) => /package|npm|yarn|pnpm|bun/i.test(item));
    if (feLocks.length) {
      lines.push(`- Node SoT: ${feLocks.map((item) => `\`${item.split(' ')[0]}\``).join(', ')}`);
    }
    lines.push('- Prefer package scripts / Make targets that touch the frontend tree; full start path is in the parent Agent Guide.');
  } else if (leaf.kind === 'backend') {
    if (evidence.make.targets.length) {
      for (const item of preferredMakeTargets(evidence.make.targets).slice(0, 6)) {
        lines.push(`- \`make ${item.name}\` — \`${recipeSummary(item).replace(/`/g, "'")}\``);
      }
    } else if (evidence.docker.composeFiles.length) {
      lines.push(`- \`docker compose -f ${evidence.docker.composeFiles[0]} up -d\``);
    } else {
      lines.push('- Backend start commands: to confirm (gather).');
    }
  } else {
    lines.push('- Surface-specific start commands: to confirm (gather).');
  }
  return lines.join('\n');
}

function buildPlatformLeaf(leaf, facts, evidence, target) {
  const stack = surfaceStackLine(leaf.parts, leaf.kind, evidence) || 'to confirm (gather)';
  const locks = surfaceLockLine(leaf.parts, leaf.kind, evidence);
  const layout = surfaceLayoutLine(leaf, evidence, target);
  const setup = surfaceSetupLine(leaf, evidence);
  const other = (facts.platformLeaves || [])
    .filter((item) => item.id !== leaf.id)
    .map((item) => `[${item.id}.md](${item.id}.md)`)
    .join(', ');

  return `# ${facts.projectName} — ${leaf.title} leaf

Focused guide for the **${leaf.title}** surface. Filled by \`gather\` from **repo evidence** when a platform split helps. Parent rules: [../../AGENTS.md](../../AGENTS.md). Operational overview: [../README.md](../README.md). Structured slots: [../project.md](../project.md).${other ? ` Sibling leaves: ${other}.` : ''}

## Surface scope

${leaf.title} work in this repo. Prefer this leaf over the full AGENTS.md stack dump when the task is ${leaf.title.toLowerCase()}-only. Shared git-flow, consume path, and cross-cutting gotchas stay in AGENTS.md.

## Stack (this surface)

- Languages / frameworks / versions: ${stack}
- Package manager / lockfile SoT: ${locks}

## Directory layout

${layout}

## Local setup (this surface)

${setup}

## Known gotchas (this surface)

${facts.gotchas || '- Surface-specific traps: to confirm (gather).'}
`;
}

function buildPlatformLeavesSection(leaves) {
  if (!leaves.length) {
    return `## Platform leaves

None yet. \`gather\` creates focused guides under [\`.agents/platforms/\`](.agents/platforms/) when the tree shows distinct surfaces (e.g. frontend + backend, app vs web). Shared cross-cutting rules stay in this file and [\`.agents/README.md\`](.agents/README.md). Start a new leaf from [\`.agents/platforms/TEMPLATE.md\`](.agents/platforms/TEMPLATE.md) only when a split helps agents load less context.
`;
  }

  const links = leaves
    .map((leaf) => `- **${leaf.title}** — [\`.agents/platforms/${leaf.id}.md\`](.agents/platforms/${leaf.id}.md)`)
    .join('\n');

  return `## Platform leaves

Distinct surfaces get focused guides under [\`.agents/platforms/\`](.agents/platforms/) so agents load only the context they need. Shared cross-cutting rules stay in this file and [\`.agents/README.md\`](.agents/README.md).

${links}
`;
}

function fillPlatformLeavesSection(text, leaves, force) {
  const block = buildPlatformLeavesSection(leaves);
  if (/^## Platform leaves\b/m.test(text)) {
    return replaceSection(text, ['Platform leaves'], block, force, () => true);
  }
  // Insert before Feature docs when present; otherwise before Gather next; else append.
  if (/^## Feature docs\b/m.test(text)) {
    return text.replace(/^## Feature docs\b/m, `${block}\n## Feature docs`);
  }
  if (/^## Gather next\b/m.test(text)) {
    return text.replace(/^## Gather next\b/m, `${block}\n## Gather next`);
  }
  return `${text.trimEnd()}\n\n${block}`;
}

function formatNotesLine(notes) {
  const useful = (notes || []).filter((note) => note.kind !== 'template-guide');
  if (!useful.length) {
    return 'none beyond template slots';
  }
  return useful
    .map((note) => {
      const extra = [];
      if (note.kind === 'existing-ops') {
        extra.push('existing Agent Guide, not overwritten');
      }
      if (note.kind === 'template-guide') {
        extra.push('template Agent Guide (filled from evidence)');
      }
      if (note.headings.length) {
        extra.push(`headings: ${note.headings.join(', ')}`);
      }
      if (note.mentions.length) {
        extra.push(`mentions ${note.mentions.join('/')}`);
      }
      return `\`${note.path}\`${extra.length ? ` — ${extra.join('; ')}` : ''}`;
    })
    .join('; ');
}

function gatherNextIntro() {
  return '`gather` is **not complete**. The evidence scan ran; interview these before treating this passport as done.';
}

function gatherNextItems(facts) {
  const items = ['Client and Product (required — gather is not complete until these are answered)'];
  if (facts.ticketPrefix === TICKET_TODO) {
    items.push('Ticket prefix — Jira key, or GH for GitHub Issues (ask, or set NEAT_OS_TICKET_PREFIX / --ticket-prefix)');
  }
  if (facts.platformLeaves && facts.platformLeaves.length) {
    items.push(
      `Confirm platform leaf split (${facts.platformLeaves.map((leaf) => leaf.id).join(' / ')}) still matches how the team works`,
    );
  }
  items.push('Environments (local / staging / production) and how they differ');
  items.push('Hosting / deploy vendor and secrets (DeployHQ etc. — only if real; do not invent)');
  if (!facts.hasStartPath) {
    items.push('Local host commands (no Makefile/Compose start path in the tree)');
  }
  items.push('macOS vs WSL2 constraints for this team, if they differ from the company default');
  return items;
}

function detectGeneratedPaths(target, make) {
  const lines = [];
  const dirs = ['assets/build', 'www/assets/build', 'public/build', 'www/public/build'];
  for (const rel of dirs) {
    if (isDir(target, rel)) {
      lines.push(`- \`${rel}/\` — compiled assets. Do not edit; rebuild from source.`);
    }
  }
  const makeText = (make.files || []).map((file) => readText(path.join(target, file))).join('\n');
  const recipes = (make.targets || []).flatMap((item) => item.recipes || []);
  if (/routes:rewrite/.test(makeText) || recipes.some((line) => /routes:rewrite/.test(line))) {
    lines.push('- Routes rewritten by a console command (`routes:rewrite`). Do not hand-edit the generated route map.');
  }
  return lines;
}

function buildGeneratedSection(evidence) {
  if (!evidence.generated.length) {
    return 'No compiled-output directories found in the usual places (`assets/build`, `public/build`). Confirm with gather if the tree generates files elsewhere.';
  }
  return ['Do not hand-edit these paths. Change the source and rebuild.', ...evidence.generated].join('\n');
}

function collectEvidence(target, scriptDir) {
  const roots = findManifestRoots(target);
  const parts = (roots.length ? roots : [{ rel: '.', reason: 'repo-root' }]).map((root) =>
    scanManifestAt(target, root.rel),
  );
  const stack = {
    composer: (parts[0] || {}).composer || null,
    pkg: (parts[0] || {}).pkg || null,
    languages: unique(parts.flatMap((part) => part.languages)),
    frameworks: unique(parts.flatMap((part) => part.frameworks)),
    lockfiles: unique(parts.flatMap((part) => part.lockfiles)),
    parts,
    roots,
  };
  const docker = detectDocker(target, roots);
  const make = detectMake(target);
  const ci = detectCi(target);
  const notes = existingAgentsNotes(target);
  const branch = detectIntegrationBranch(target);
  const consume = scriptDir ? detectConsumeMode(scriptDir, target) : { mode: 'unknown', raw: '' };
  const packageScripts = detectPackageScripts(parts);
  const generated = detectGeneratedPaths(target, make);
  return { stack, docker, make, ci, notes, branch, consume, roots, parts, packageScripts, generated };
}

function setBullet(text, label, value, force) {
  if (!value) {
    return text;
  }
  const re = new RegExp(`^(- ${escapeRegExp(label)}:)(.*)$`, 'm');
  const match = text.match(re);
  if (!match) {
    return text;
  }
  const current = match[2].trim();
  if (!force && !isPlaceholder(current)) {
    return text;
  }
  return text.replace(re, `$1 ${value}`);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replacePlaceholderLine(text, needle, replacement, force) {
  if (!replacement) {
    return text;
  }
  if (!text.includes(needle)) {
    return text;
  }
  if (!force && !isPlaceholder(needle) && !/\{\{/.test(needle)) {
    return text;
  }
  return text.split(needle).join(replacement);
}

function consumeSentence(mode) {
  const base =
    'How this project consumes neat-os (resolve and stop at the first hit: `NEAT_OS_ROOT`, then `github:shedcollective/neat-os#vX.Y.Z` or `file:../neat-os` → `node_modules/`, then Composer `shedcollective/neat-os` → `vendor/` which is PHP metadata only and does not ship skills/templates, then sibling `../neat-os`). `SHED_OS_ROOT`, `@shedcollective/shed-os`, and `../shed-os` still resolve and are deprecated. Do not search the public web for neat-os. Do not copy skills into this repo.';
  if (!mode || mode === 'unknown') {
    return `${base} Consume mode: to confirm.`;
  }
  if (mode === 'missing') {
    return `${base} Evidence passport: consume path **missing** — do not web-search; add a git pin or sibling checkout.`;
  }
  return `${base} Evidence passport: consume mode **${mode}**.`;
}

function replaceSection(text, headings, block, force, isPlaceholderFn) {
  const headingAlt = headings.map(escapeRegExp).join('|');
  const re = new RegExp(`## (?:${headingAlt})\\n[\\s\\S]*?(?=\\n## |$)`);
  const match = text.match(re);
  if (!match) {
    return `${text.trimEnd()}\n\n${block}`;
  }
  if (!force && isPlaceholderFn && !isPlaceholderFn(match[0])) {
    return text;
  }
  return text.replace(re, block.trimEnd() + '\n');
}

function isOpenQuestionsPlaceholder(section) {
  const body = section.replace(/^## .*\n/, '');
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) {
    return true;
  }
  if (lines.every((line) => line === '-' || /^\{\{/.test(line))) {
    return true;
  }
  if (/True unknowns/.test(section) && (/init does not invent/.test(section) || /Interview these/.test(section))) {
    return true;
  }
  if (/not complete/i.test(section) && /interview/i.test(section)) {
    return true;
  }
  return lines.every(
    (line) =>
      line === '-' ||
      /^True unknowns/.test(line) ||
      /`gather` interviews/.test(line) ||
      /not complete/i.test(line) ||
      /Awaiting interview/i.test(line) ||
      /^- Client/.test(line) ||
      /^- Jira/.test(line) ||
      /^- Environments/.test(line) ||
      /^- Hosting/.test(line) ||
      /^- Local host/.test(line) ||
      /^- Ticket/.test(line) ||
      /^- macOS/.test(line),
  );
}

function interviewOverviewParagraph(productHint) {
  const hint = productHint
    ? ` Tree hint (package description — **not** a client brief): From \`${productHint.source}\`: ${productHint.text}.`
    : '';
  return `**Awaiting interview.** Client and Product are not sitting in the tree. \`gather\` is **not complete** until they are answered.${hint}`;
}

function clientProductBlock(facts) {
  const hint = facts.productHint
    ? `\n\nTree hint (package description — **not** a client brief): From \`${facts.productHint.source}\`: ${facts.productHint.text}.`
    : '';
  return `## Client & product

**Awaiting interview.** The evidence scan cannot name the client or product. \`gather\` is **not complete** until these are answered (IDE chat, or answers pre-supplied in the prompt). Do not invent them. Docker/Make evidence belongs under Layout & start, not here.

- Client: ${AWAITING_INTERVIEW}
- Product (one paragraph): ${AWAITING_INTERVIEW}
- In scope / out of scope: ${AWAITING_INTERVIEW}
- Names or data that must not be renamed or exposed: ${AWAITING_INTERVIEW}${hint}
`;
}

function isProjectSectionAwaiting(section) {
  return (
    /Awaiting interview/i.test(section) ||
    /\{\{one paragraph/.test(section) ||
    /to confirm — not a client brief/.test(section) ||
    /Client \/ product brief: to confirm/.test(section) ||
    /Start from repo evidence:/.test(section)
  );
}

function isClientProductAwaiting(section) {
  const client = ((section.match(/^- Client:\s*(.*)$/m) || [])[1] || '').trim();
  const product = ((section.match(/^- Product(?: \(one paragraph\))?:\s*(.*)$/m) || [])[1] || '').trim();
  const clientEmpty = isPlaceholder(client);
  const productIsHint =
    isPlaceholder(product) || /not a client brief/i.test(product) || /^From \S+:/.test(product);
  if (!clientEmpty || !productIsHint) {
    return false;
  }
  if (/Awaiting interview/i.test(section)) {
    return true;
  }
  const stuffedScope = /Repo shape \(evidence\)/i.test(section) || /Product scope: to confirm/i.test(section);
  return stuffedScope || (clientEmpty && productIsHint);
}

function ensureLayoutSections(text) {
  if (/^## Layout & start/m.test(text)) {
    return text;
  }
  const block = `## Layout & start (repo evidence)

- App root(s): {{to confirm}}
- Containers / Compose: {{to confirm}}
- Makefile / task runner: {{to confirm}}
- How to start (from evidence): {{to confirm}}

## Existing notes

- Cited notes: {{to confirm}}

`;
  if (/^## (Gather next|Open questions)/m.test(text)) {
    return text.replace(/^## (Gather next|Open questions)/m, `${block}## $1`);
  }
  return `${text.trimEnd()}\n\n${block}`;
}

function fillProjectMd(text, facts, force) {
  let out = ensureLayoutSections(text);
  out = out.replace(
    /Filled by \*\*gather\*\* \(greenfield\) or by humans from known project truth\./,
    'Filled by **gather** (repo evidence + interview) after **init** scaffolds these slots, or by humans from known project truth.',
  );
  out = out.replace(
    /Filled by \*\*init\*\* \(light scan\) then \*\*gather\*\* \(deep dive\), or by humans from known project truth\./,
    'Filled by **gather** (repo evidence + interview) after **init** scaffolds these slots, or by humans from known project truth.',
  );
  out = out.replace(
    /Filled by \*\*init\*\* \(light scan of the repo\) and \*\*gather\*\* \(deep dive\)\./,
    'Filled by **gather** (repo evidence + interview) after **init** scaffolds these slots, or by humans from known project truth.',
  );
  out = out.replace(
    /Filled by \*\*init\*\* \(evidence passport from the repo tree\) then \*\*gather\*\* \(interview \/ unknowns not sitting in the tree\), or by humans from known project truth\./,
    'Filled by **gather** (repo evidence + interview) after **init** scaffolds these slots, or by humans from known project truth.',
  );
  out = out.replace(
    /Filled by \*\*init\*\* \(evidence feeds the IDE spread: Agent Guide \+ this file\) then \*\*gather\*\* \(interview \/ unknowns not sitting in the tree\), or by humans from known project truth\./,
    'Filled by **gather** (repo evidence + interview) after **init** scaffolds these slots, or by humans from known project truth.',
  );
  out = out.replace(
    /Filled by \*\*gather\*\* \(repo evidence \+ interview\) after \*\*init\*\* scaffolds these slots, or by humans from known project truth\. Agents must not invent answers\. Use `to confirm` for gaps\./,
    'Filled by **gather** (repo evidence + interview) after **init** scaffolds these slots, or by humans from known project truth.\n\n**Gather is not complete** until interview fields (especially Client and Product) are filled. A scan-only passport is a start, not a finish.',
  );
  if (!out.includes('Gather is not complete')) {
    out = out.replace(
      /(Filled by \*\*gather\*\* \(repo evidence \+ interview\) after \*\*init\*\* scaffolds these slots, or by humans from known project truth\.)\n(?:\nAgents must not invent answers\. Use `to confirm` for gaps\.\n)?/,
      '$1\n\n**Gather is not complete** until interview fields (especially Client and Product) are filled. A scan-only passport is a start, not a finish.\n',
    );
  }

  out = replaceSection(out, ['Client & product'], clientProductBlock(facts), force, isClientProductAwaiting);

  out = setBullet(out, 'Languages / frameworks / versions', facts.stack || '', force);
  out = setBullet(out, 'Package manager / lockfiles', facts.lockfiles || '', force);
  out = setBullet(out, 'Hosting / CI / deploy', facts.ci || '', force);
  out = setBullet(out, 'Integration branch (usually `develop`)', facts.integration || '', force);
  out = setBullet(out, 'Ticket prefix', facts.ticketPrefix, force);
  out = setBullet(out, 'App root(s)', facts.appRoots || '', force);
  out = setBullet(out, 'Containers / Compose', facts.compose || '', force);
  out = setBullet(out, 'Makefile / task runner', facts.make || '', force);
  out = setBullet(out, 'How to start (from evidence)', facts.howToStart || '', force);
  out = setBullet(out, 'Environments (local / staging / production)', AWAITING_INTERVIEW, force);
  out = setBullet(out, 'OS notes (macOS / WSL2)', AWAITING_INTERVIEW, force);
  out = setBullet(out, 'Cited notes', facts.notesLine || '', force);
  out = setBullet(out, 'Cited (not overwritten)', facts.notesLine || '', force);

  if (facts.consume && (force || out.includes('{{to confirm}}'))) {
    out = out.replace(/How this project consumes neat-os[\s\S]*?\{\{to confirm\}\}/, facts.consume);
  }

  const gatherBlock = `## Gather next\n\n${gatherNextIntro()}\n\n${gatherNextItems(facts)
    .map((item) => `- ${item}`)
    .join('\n')}\n`;
  out = replaceSection(out, ['Gather next', 'Open questions'], gatherBlock, force, isOpenQuestionsPlaceholder);

  if (!out.endsWith('\n')) {
    out += '\n';
  }
  return out;
}

// A template or previously gathered AGENTS.md carries mustache slots, the
// template's gather sentence, or a Gather next section. Anything else is
// hand-written project truth: cite it, do not append sections to it.
function isTemplateAgentsMd(text) {
  const body = String(text || '');
  if (!body.trim()) {
    return true;
  }
  return /\{\{/.test(body) || /`gather` fills this file/.test(body) || /^## Gather next\b/m.test(body);
}

function fillAgentsMd(text, facts, force) {
  if (!force && !isTemplateAgentsMd(text)) {
    return text.endsWith('\n') ? text : `${text}\n`;
  }
  let out = text;
  out = replacePlaceholderLine(
    out,
    'Fill placeholders via `gather` or from files you have read.',
    '`gather` fills this file **and** the operational [`.agents/README.md`](.agents/README.md) Agent Guide from repo evidence (Docker/Make/stack/layout/start) plus interview. `init` only scaffolds the slots.',
    true,
  );
  out = replacePlaceholderLine(
    out,
    'Fill placeholders via `init` (light scan) then `gather` (deep dive), or from files you have read.',
    '`gather` fills this file **and** the operational [`.agents/README.md`](.agents/README.md) Agent Guide from repo evidence (Docker/Make/stack/layout/start) plus interview. `init` only scaffolds the slots.',
    true,
  );
  out = replacePlaceholderLine(
    out,
    'Fill placeholders via `init` (evidence passport from the repo) then `gather` (deep dive / interview), or from files you have read.',
    '`gather` fills this file **and** the operational [`.agents/README.md`](.agents/README.md) Agent Guide from repo evidence (Docker/Make/stack/layout/start) plus interview. `init` only scaffolds the slots.',
    true,
  );
  out = replacePlaceholderLine(
    out,
    '`init` fills this file **and** the operational [`.agents/README.md`](.agents/README.md) Agent Guide from repo evidence (Docker/Make/stack/layout/start). `gather` is the deep dive for unknowns not in the tree.',
    '`gather` fills this file **and** the operational [`.agents/README.md`](.agents/README.md) Agent Guide from repo evidence (Docker/Make/stack/layout/start) plus interview. `init` only scaffolds the slots.',
    true,
  );

  if (facts.projectName && (force || out.includes('{{PROJECT_NAME}}'))) {
    out = out.split('{{PROJECT_NAME}}').join(facts.projectName);
  }

  const projectPara = facts.projectParagraph;
  if (projectPara) {
    out = replaceSection(out, ['Project'], `## Project\n\n${projectPara}\n`, force, isProjectSectionAwaiting);
    if (/\{\{one paragraph: client \+ product\. to confirm\}\}/.test(out)) {
      out = out.replace(/\{\{one paragraph: client \+ product\. to confirm\}\}/, projectPara);
    }
  }

  if (facts.stack && (force || out.includes('Languages / frameworks / versions: {{to confirm}}'))) {
    out = out.replace(
      '- Languages / frameworks / versions: {{to confirm}}',
      `- Languages / frameworks / versions: ${facts.stack}`,
    );
  } else if (facts.stack) {
    out = setBullet(out, 'Languages / frameworks / versions', facts.stack, force);
  }

  if (facts.lockfiles && (force || out.includes('Package manager / lockfile SoT: {{to confirm}}'))) {
    out = out.replace(
      '- Package manager / lockfile SoT: {{to confirm}}',
      `- Package manager / lockfile SoT: ${facts.lockfiles}`,
    );
  } else if (facts.lockfiles) {
    out = setBullet(out, 'Package manager / lockfile SoT', facts.lockfiles, force);
  }

  if (facts.ci && (force || out.includes('Hosting / CI / deploy: {{to confirm}}'))) {
    out = out.replace('- Hosting / CI / deploy: {{to confirm}}', `- Hosting / CI / deploy: ${facts.ci}`);
  } else if (facts.ci) {
    out = setBullet(out, 'Hosting / CI / deploy', facts.ci, force);
  }

  if (facts.stackRules && (force || /\{\{to confirm — do not guess\}\}/.test(out))) {
    out = out.replace(
      'Load-bearing decisions, rationale, and where each lives. {{to confirm — do not guess}}',
      facts.stackRules,
    );
  }

  if (force || out.includes('Domain gotchas and "do NOT rename X". {{to confirm}}')) {
    out = out.replace(
      'Domain gotchas and "do NOT rename X". {{to confirm}}',
      facts.projectSpecific || 'Domain names / do-not-rename: awaiting interview.',
    );
  }

  if (facts.integrationName && facts.integrationName !== 'develop') {
    out = out.replace(
      '- Integration branch: `develop` (PRs land here)',
      `- Integration branch: \`${facts.integrationName}\` (PRs land here; ${facts.integrationNote || 'from scan'})`,
    );
  }

  if (out.includes('{{TICKET}}')) {
    out = out.split('{{TICKET}}').join(facts.ticketKey || 'TICKET');
  }

  if (facts.repoStructure && (force || out.includes('{{annotated tree'))) {
    out = out.replace(/\{\{annotated tree — derive from the repo; do not invent\}\}/, facts.repoStructure);
  }

  if (facts.localSetup && (force || out.includes('Exact commands per sub-project, verified in-repo.'))) {
    out = out.replace('Exact commands per sub-project, verified in-repo.', facts.localSetup);
  }

  if (facts.gotchas && (force || /\{\{traps that bite agents/.test(out))) {
    out = out.replace(
      /\{\{traps that bite agents, including cross-OS: WSL2 localhost forwarding, file-watchers, toolchain version parity\. to confirm\}\}/,
      facts.gotchas,
    );
  }

  if (facts.featureDocsExtra) {
    const anchor = 'Living reference docs: `.agents/docs/`.';
    if (out.includes(anchor) && (force || !out.includes('Cited existing notes:'))) {
      out = out.replace(anchor, `${anchor}\n\nCited existing notes:\n${facts.featureDocsExtra}`);
    }
  }

  out = fillPlatformLeavesSection(out, facts.platformLeaves || [], force);
  out = fillStackPacksSection(out, facts.stackPacks || [], force);

  if (facts.platformLeaves && facts.platformLeaves.length) {
    const featureAnchor = 'Living reference docs: `.agents/docs/`.';
    const platformNote =
      ' Platform-specific brief: `.agents/platforms/` (see **Platform leaves** above).';
    if (out.includes(featureAnchor) && !out.includes('Platform-specific brief: `.agents/platforms/`')) {
      out = out.replace(
        featureAnchor,
        `${featureAnchor}${platformNote}`,
      );
    }
  }

  const gatherBlock = `## Gather next\n\n${gatherNextIntro()}\n\n${gatherNextItems(facts)
    .map((item) => `- ${item}`)
    .join('\n')}\n`;
  if (/^## Gather next/m.test(out)) {
    out = replaceSection(out, ['Gather next'], gatherBlock, force, isOpenQuestionsPlaceholder);
  } else {
    out = `${out.trimEnd()}\n\n${gatherBlock}`;
  }

  if (facts.projectName) {
    out = out.split('{{PROJECT_NAME}}').join(facts.projectName);
  }
  if (out.includes('{{TICKET}}')) {
    out = out.split('{{TICKET}}').join(facts.ticketKey || 'TICKET');
  }

  if (!out.endsWith('\n')) {
    out += '\n';
  }
  return out;
}

function makeRecipesWrapDocker(make) {
  return (make.targets || []).some((item) => /docker\s+compose|docker-compose/.test((item.recipes || []).join(' ')));
}

function buildCriticalDocker(evidence) {
  if (!evidence.docker.composeFiles.length && !evidence.docker.dockerfiles.length) {
    return 'No Compose or Dockerfile found in the tree. Container rules: to confirm (gather).';
  }
  const lines = ['From repo evidence — do not invent a host toolchain:'];
  if (evidence.docker.composeFiles.length) {
    lines.push(
      `- Compose file(s): ${evidence.docker.composeFiles.map((file) => `\`${file}\``).join(', ')}`,
    );
  }
  if (evidence.docker.services.length) {
    const names = unique(evidence.docker.services.map((service) => service.name));
    const ports = unique(evidence.docker.services.flatMap((service) => service.ports || []));
    lines.push(
      `- Services: ${names.map((name) => `\`${name}\``).join(', ')}` +
        (ports.length ? ` (ports ${ports.join(', ')})` : ''),
    );
  }
  for (const image of evidence.docker.images.slice(0, 4)) {
    lines.push(
      `- \`${image.file}\`` +
        (image.from.length ? ` FROM ${image.from.join(', ')}` : '') +
        (image.workdir ? ` WORKDIR ${image.workdir}` : '') +
        (image.expose && image.expose.length ? ` EXPOSE ${image.expose.join(', ')}` : ''),
    );
  }
  if (makeRecipesWrapDocker(evidence.make)) {
    lines.push(
      '- **Container-first:** Make recipes wrap `docker compose`. Do not run Composer/npm/artisan on the host unless gather confirms a host toolchain.',
    );
  } else {
    lines.push(
      '- Prefer Compose / container commands over assuming a host PHP/Node SoT unless gather confirms otherwise.',
    );
  }
  return lines.join('\n');
}

function buildMakeSection(evidence) {
  if (!evidence.make.targets.length) {
    return 'No Makefile found in the tree. Task runner: to confirm (gather).';
  }
  const lines = [`From \`${evidence.make.files[0]}\`:`];
  for (const item of preferredMakeTargets(evidence.make.targets).slice(0, 12)) {
    lines.push(`- \`make ${item.name}\` — \`${recipeSummary(item).replace(/`/g, "'")}\``);
  }
  return lines.join('\n');
}

function buildArchitecture(evidence, facts) {
  const lines = [];
  if (facts.appRoots) {
    lines.push(`- App root(s): ${facts.appRoots}`);
  }
  if (facts.compose && facts.compose !== 'none found in the tree') {
    lines.push(`- Containers: ${facts.compose}`);
  }
  if (facts.stack) {
    lines.push(`- Stack: ${facts.stack}`);
  }
  if (facts.lockfiles) {
    lines.push(`- Package SoT: ${facts.lockfiles}`);
  }
  if (!lines.filter(Boolean).length) {
    return 'Architecture: to confirm (gather — thin tree).';
  }
  return lines.join('\n').trim();
}

function buildAgentsGuide(facts, evidence) {
  const gather = gatherNextItems(facts)
    .map((item) => `- ${item}`)
    .join('\n');
  const cited = facts.featureDocsExtra ? `\nCited existing notes:\n${facts.featureDocsExtra}\n` : '';
  return `# ${facts.projectName} — Agent Guide

Operational guide for agents in this repo. Filled by \`gather\` from **repo evidence** plus interview. Canonical cross-IDE rules: [AGENTS.md](../AGENTS.md). Structured slots: [project.md](project.md). \`gather\` is **not complete** until Client and Product are interviewed.

Company playbooks (\`init\`, \`gather\`, \`learn\`, \`ticket\`, \`assurance\`, \`pin-majors-with-reasons\`, \`release\`) live in [shedcollective/neat-os](https://github.com/shedcollective/neat-os). Resolve in this order and stop at the first hit: \`NEAT_OS_ROOT\`, then \`require('@shedcollective/neat-os').skillsDir\` after \`file:\` / \`github:\` (\`node_modules/\`), then sibling \`../neat-os\`. \`SHED_OS_ROOT\` and the shed-os paths still resolve and are deprecated. Do **not** search the public web for neat-os. Do **not** copy them into \`.agents/skills/\`.

## Overview

${facts.projectParagraph}

## Critical Docker / container rules

${buildCriticalDocker(evidence)}

## Makefile / task runner

${buildMakeSection(evidence)}

## Architecture

${buildArchitecture(evidence, facts)}

## Directory layout

${facts.repoStructure}

## Generated paths

${buildGeneratedSection(evidence)}

## How to start

${facts.localSetup}

- Team machines are macOS or Windows via WSL2. **On WSL2 the repo must live on the Linux filesystem** (e.g. \`~/GitRepos/…\` on ext4), never under \`/mnt/c/…\`.

## Project slots

- Structured facts: [project.md](project.md)
- Feature plans: [features/](features/) (start from [features/TEMPLATE.md](features/TEMPLATE.md))
- Dependency pins: [dependencies/pins.md](dependencies/pins.md)
- Living docs: [docs/](docs/)
- Platform leaves: [platforms/](platforms/)${(facts.platformLeaves || []).length ? ` (${(facts.platformLeaves || [])
    .map((leaf) => `[${leaf.id}.md](platforms/${leaf.id}.md)`)
    .join(', ')})` : ' (`gather` creates frontend/backend/… leaves when a split helps)'}
- Stack packs: ${(facts.stackPacks || []).length ? (facts.stackPacks || [])
    .map((pack) => `${pack.title} (\`${pack.files[0].replace(/\/[^/]+$/, '/')}\` in resolved neat-os; not copied)`)
    .join(', ') : 'listed in AGENTS.md when gather matches a pack in neat-os'}
- Proposals: [proposals/](proposals/) (\`learn\` drafts — not org skills)
${cited}
## Gather next

${gatherNextIntro()}

${gather}
`;
}

// An Agent Guide that gather wrote from evidence carries this marker. On
// re-scan only its evidence sections are refreshed; Overview and anything a
// human added stay as they are. Hand-written guides never match.
function isEvidenceAgentsGuide(text) {
  const body = String(text || '');
  return /— Agent Guide\n/.test(body) && /Filled by `gather` from \*\*repo evidence\*\*/.test(body);
}

function refreshAgentsGuide(text, facts, evidence) {
  let out = text;
  const blocks = [
    [['Critical Docker / container rules'], buildCriticalDocker(evidence)],
    [['Makefile / task runner'], buildMakeSection(evidence)],
    [['Architecture'], buildArchitecture(evidence, facts)],
    [['Directory layout'], facts.repoStructure],
    [['Generated paths'], buildGeneratedSection(evidence)],
    [
      ['How to start'],
      `${facts.localSetup}\n\n- Team machines are macOS or Windows via WSL2. **On WSL2 the repo must live on the Linux filesystem** (e.g. \`~/GitRepos/…\` on ext4), never under \`/mnt/c/…\`.`,
    ],
  ];
  for (const [headings, body] of blocks) {
    if (new RegExp(`^## ${escapeRegExp(headings[0])}\\n`, 'm').test(out)) {
      out = replaceSection(out, headings, `## ${headings[0]}\n\n${body}\n`, true);
    }
  }
  const gatherBlock = `## Gather next\n\n${gatherNextIntro()}\n\n${gatherNextItems(facts)
    .map((item) => `- ${item}`)
    .join('\n')}\n`;
  out = replaceSection(out, ['Gather next'], gatherBlock, false, isOpenQuestionsPlaceholder);
  return out.endsWith('\n') ? out : `${out}\n`;
}

function maybeWriteReadmeStub(target, projectName) {
  const readme = path.join(target, 'README.md');
  if (fs.existsSync(readme)) {
    return false;
  }
  const body = `# ${projectName}\n\nAgent start brief: [AGENTS.md](AGENTS.md). Structured facts: [.agents/project.md](.agents/project.md).\n`;
  fs.writeFileSync(readme, body);
  return true;
}

function writeIfChanged(file, next) {
  const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (prev === next) {
    return false;
  }
  fs.writeFileSync(file, next);
  return true;
}

// neat-os itself and its neat-os-tool-* leaves track work as GitHub Issues
// (conventions/tickets.md). Names matching neat-os-platform-* still get GH
// so existing OS-leaf repos keep working.
function isOsRepo(target, evidence) {
  if (evidence.consume && evidence.consume.mode === 'checkout') {
    return true;
  }
  const names = [path.basename(target)];
  for (const part of evidence.parts || []) {
    if (part.pkg && typeof part.pkg.name === 'string') {
      names.push(part.pkg.name);
    }
    if (part.composer && typeof part.composer.name === 'string') {
      names.push(part.composer.name);
    }
  }
  return names.some((name) => /(^|\/)(?:neat-os|shed-os)(-platform-|-tool-|$)/.test(name));
}

function buildFacts(target, evidence, opts) {
  const productHint = detectDescription(evidence.parts);
  const projectName = detectProjectName(target, evidence.parts);
  const givenPrefix = opts.ticketPrefix || opts.jiraPrefix || '';
  let ticketKey = '';
  let ticketPrefix = TICKET_TODO;
  if (givenPrefix) {
    ticketKey = givenPrefix.replace(/[^A-Za-z0-9]+/g, '').toUpperCase();
    ticketPrefix = ticketKey;
  } else if (isOsRepo(target, evidence)) {
    ticketKey = 'GH';
    ticketPrefix = OS_REPO_TICKET;
  }

  const integration = evidence.branch.note
    ? `${evidence.branch.name} — ${evidence.branch.note}`
    : evidence.branch.name;

  const startBrief = buildStartBrief(evidence);
  const howToStart = evidence.make.targets.length
    ? preferredMakeTargets(evidence.make.targets)
        .slice(0, 6)
        .map((item) => `\`make ${item.name}\` — \`${recipeSummary(item).replace(/`/g, "'")}\``)
        .join('; ')
    : evidence.docker.composeFiles.length
      ? `\`docker compose -f ${evidence.docker.composeFiles[0]} up -d\` (no Makefile in the tree)`
      : evidence.packageScripts && evidence.packageScripts.length
        ? `${evidence.packageScripts.slice(0, 6).map(formatScriptLine).join('; ')} (package.json scripts; no Makefile or Compose in the tree)`
        : 'No Makefile or Compose start path found — gather for host commands.';

  const featureNotes = evidence.notes.filter((note) => {
    if (note.path === 'README.md' && note.kind === 'readme') {
      return false;
    }
    if (note.path === '.agents/README.md' && note.kind === 'template-guide') {
      return false;
    }
    return true;
  });
  const featureDocsExtra = featureNotes.length
    ? featureNotes
        .map((note) => {
          const title = note.headings[0] ? ` — ${note.headings[0]}` : '';
          const mention = note.mentions.length ? ` (${note.mentions.join('/')})` : '';
          return `- \`${note.path}\`${title}${mention}`;
        })
        .join('\n')
    : '';

  const platformDecision = decidePlatformLeaves(evidence, target);

  return {
    projectName,
    productHint,
    projectParagraph: interviewOverviewParagraph(productHint),
    startBrief,
    stack: stackLine(evidence.stack),
    lockfiles: lockLine(evidence.stack),
    ci: ciLineFromEvidence(evidence.ci),
    integration,
    integrationName: evidence.branch.name,
    integrationNote: evidence.branch.note || evidence.branch.source,
    ticketPrefix,
    ticketKey,
    consume: consumeSentence(evidence.consume.mode),
    repoStructure: buildRepoStructure(target, evidence.stack, evidence.notes, evidence.docker, evidence.make),
    clientFilled: false,
    appRoots: appRootLine(evidence.parts, evidence.roots),
    compose: formatComposeLine(evidence.docker),
    make: evidence.make.targets.length
      ? `${evidence.make.files.map((file) => `\`${file}\``).join(', ')}: ${formatMakeLine(evidence.make.targets)}`
      : 'none found in the tree',
    howToStart,
    notesLine: formatNotesLine(evidence.notes),
    localSetup: buildLocalSetup(evidence),
    stackRules: buildStackRules(evidence),
    gotchas: buildGotchas(evidence),
    projectSpecific: buildProjectSpecific(evidence),
    featureDocsExtra,
    hasStartPath: Boolean(
      evidence.make.targets.length || evidence.docker.composeFiles.length || (evidence.packageScripts || []).length,
    ),
    platformLeaves: platformDecision.leaves,
    platformSurfaces: platformDecision.surfaces,
    stackPacks: detectStackPacks(evidence, opts.osRoot),
  };
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`error: ${err.message}\n${usage()}`);
    process.exit(2);
  }

  let target = opts.target;
  if (!target) {
    target = gitRoot(process.cwd());
  }
  if (!target) {
    process.stderr.write('error: not inside a git repository and no TARGET_DIR given\n');
    process.exit(1);
  }
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    process.stderr.write(`error: target is not a directory: ${target}\n`);
    process.exit(1);
  }
  target = fs.realpathSync(target);
  if (!gitRoot(target)) {
    process.stderr.write(`error: ${target} is not a git repository\n`);
    process.exit(1);
  }

  const agentsPath = path.join(target, 'AGENTS.md');
  const projectPath = path.join(target, '.agents/project.md');
  if (!fs.existsSync(agentsPath) || !fs.existsSync(projectPath)) {
    process.stderr.write('error: AGENTS.md or .agents/project.md missing — run copy-templates.sh first\n');
    process.exit(1);
  }

  const evidence = collectEvidence(target, __dirname);
  const facts = buildFacts(target, evidence, opts);

  const projectNext = fillProjectMd(fs.readFileSync(projectPath, 'utf8'), facts, opts.force);
  const agentsPrev = fs.readFileSync(agentsPath, 'utf8');
  const agentsHandWritten = !opts.force && !isTemplateAgentsMd(agentsPrev);
  const agentsNext = fillAgentsMd(agentsPrev, facts, opts.force);

  const wroteProject = writeIfChanged(projectPath, projectNext);
  const wroteAgents = writeIfChanged(agentsPath, agentsNext);
  const wroteReadme = maybeWriteReadmeStub(target, facts.projectName);

  const agentsReadmePath = path.join(target, '.agents/README.md');
  const existingGuide = fs.existsSync(agentsReadmePath) ? fs.readFileSync(agentsReadmePath, 'utf8') : '';
  let wroteAgentsReadme = false;
  const guideHandWritten = !opts.force && !isFillableAgentsReadme(existingGuide) && !isEvidenceAgentsGuide(existingGuide);
  if (opts.force || isFillableAgentsReadme(existingGuide)) {
    fs.mkdirSync(path.dirname(agentsReadmePath), { recursive: true });
    wroteAgentsReadme = writeIfChanged(agentsReadmePath, buildAgentsGuide(facts, evidence));
  } else if (isEvidenceAgentsGuide(existingGuide)) {
    wroteAgentsReadme = writeIfChanged(agentsReadmePath, refreshAgentsGuide(existingGuide, facts, evidence));
  }

  const platformsDir = path.join(target, '.agents/platforms');
  fs.mkdirSync(platformsDir, { recursive: true });
  const wroteLeaves = [];
  for (const leaf of facts.platformLeaves || []) {
    const leafPath = path.join(platformsDir, `${leaf.id}.md`);
    const existingLeaf = fs.existsSync(leafPath) ? fs.readFileSync(leafPath, 'utf8') : '';
    if (!(opts.force || isFillablePlatformLeaf(existingLeaf))) {
      continue;
    }
    const body = buildPlatformLeaf(leaf, facts, evidence, target);
    if (writeIfChanged(leafPath, body)) {
      wroteLeaves.push(`.agents/platforms/${leaf.id}.md`);
    }
  }

  const wrote = [
    wroteAgents && 'AGENTS.md',
    wroteProject && '.agents/project.md',
    wroteAgentsReadme && '.agents/README.md (Agent Guide)',
    wroteReadme && 'README.md (stub)',
    ...wroteLeaves,
  ].filter(Boolean);

  process.stdout.write(`target:       ${target}\n`);
  process.stdout.write(`project:      ${facts.projectName}\n`);
  process.stdout.write(`stack:        ${facts.stack || '(no stack signal)'}\n`);
  process.stdout.write(`lockfiles:    ${facts.lockfiles || '(none)'}\n`);
  process.stdout.write(`ci/host:      ${facts.ci || '(none)'}\n`);
  process.stdout.write(`app-roots:    ${facts.appRoots}\n`);
  process.stdout.write(`compose:      ${facts.compose}\n`);
  process.stdout.write(`make:         ${facts.make}\n`);
  process.stdout.write(
    `platforms:    ${(facts.platformLeaves || []).map((leaf) => leaf.id).join(', ') || '(none — single surface or no split signal)'}\n`,
  );
  process.stdout.write(
    `stack-packs:  ${(facts.stackPacks || []).map((pack) => pack.id).join(', ') || '(none)'}\n`,
  );
  process.stdout.write(`branch:       ${facts.integration}\n`);
  process.stdout.write(`ticket:       ${facts.ticketPrefix}\n`);
  process.stdout.write(`consume:      ${evidence.consume.mode}\n`);
  process.stdout.write(`wrote:        ${wrote.join(', ') || 'none (already filled)'}\n`);
  const cited = [agentsHandWritten && 'AGENTS.md', guideHandWritten && '.agents/README.md'].filter(Boolean);
  if (cited.length) {
    process.stdout.write(`cited:        ${cited.join(', ')} (hand-written; not modified — re-run with --force to replace)\n`);
  }
  process.stdout.write(
    wroteAgentsReadme
      ? 'gather: evidence scan wrote the IDE spread; interview still required (Client / Product). gather is not complete.\n'
      : 'gather: evidence scan updated the IDE spread (existing Agent Guide cited); interview still required. gather is not complete.\n',
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  TICKET_TODO,
  JIRA_TODO,
  OS_REPO_TICKET,
  isOsRepo,
  isTemplateAgentsMd,
  isEvidenceAgentsGuide,
  refreshAgentsGuide,
  detectPackageScripts,
  detectStack,
  hasNails,
  hasWordPress,
  hasLaravel,
  isPlaceholder,
  findManifestRoots,
  parseComposeServices,
  parseMakefileTargets,
  parseGithubWorkflow,
  detectDocker,
  detectMake,
  detectGeneratedPaths,
  collectEvidence,
  buildFacts,
  fillProjectMd,
  fillAgentsMd,
  isFillableAgentsReadme,
  isTemplateAgentsReadme,
  isClientProductAwaiting,
  buildAgentsGuide,
  buildCriticalDocker,
  buildMakeSection,
  classifySurfaces,
  decidePlatformLeaves,
  buildPlatformLeaf,
  buildPlatformLeavesSection,
  fillPlatformLeavesSection,
  detectStackPacks,
  buildStackPacksSection,
  fillStackPacksSection,
  isFillablePlatformLeaf,
  AWAITING_INTERVIEW,
};
