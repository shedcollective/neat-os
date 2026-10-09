'use strict';

/**
 * Locate a neat-os knowledge root for launch skills (init, gather, learn).
 *
 * Locked order — stop at the first hit:
 *   1. NEAT_OS_ROOT (absolute path, valid os tree). SHED_OS_ROOT is a deprecated fallback.
 *   2. node_modules/@shedcollective/neat-os (walk up, or require.resolve).
 *      node_modules/@shedcollective/shed-os is a deprecated fallback.
 *   3. vendor/shedcollective/neat-os (walk up; PHP metadata only).
 *      vendor/shedcollective/shed-os is a deprecated fallback.
 *   4. sibling ../neat-os. ../shed-os is a deprecated fallback.
 *   5. target itself is a neat-os checkout (this repo)
 *
 * Do not search the public web for “neat-os init”.
 */

const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const NODE_REL = path.join('node_modules', '@shedcollective', 'neat-os');
const NODE_REL_DEPRECATED = path.join('node_modules', '@shedcollective', 'shed-os');
const VENDOR_REL = path.join('vendor', 'shedcollective', 'neat-os');
const VENDOR_REL_DEPRECATED = path.join('vendor', 'shedcollective', 'shed-os');

function isOsTree(dir) {
  if (!dir) {
    return false;
  }
  try {
    return (
      fs.existsSync(path.join(dir, 'skills')) &&
      fs.existsSync(path.join(dir, 'templates')) &&
      fs.existsSync(path.join(dir, 'package.json'))
    );
  } catch {
    return false;
  }
}

function realpathIfExists(dir) {
  try {
    if (dir && fs.existsSync(dir)) {
      return fs.realpathSync(dir);
    }
  } catch {
    return '';
  }
  return '';
}

function walkUpFor(start, rel) {
  let dir = path.resolve(start);
  const seen = new Set();
  while (!seen.has(dir)) {
    seen.add(dir);
    const hit = realpathIfExists(path.join(dir, rel));
    if (hit) {
      return hit;
    }
    const parent = path.resolve(dir, '..');
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return '';
}

function uniqueStarts(fromDir) {
  const starts = [path.resolve(fromDir)];
  const cwd = path.resolve(process.cwd());
  if (cwd !== starts[0]) {
    starts.push(cwd);
  }
  return starts;
}

function resolveViaRequire(fromDir, packageName) {
  const anchors = [
    path.join(fromDir, 'package.json'),
    path.join(fromDir, 'noop.js'),
  ];
  for (const anchor of anchors) {
    try {
      const req = createRequire(anchor);
      return path.dirname(fs.realpathSync(req.resolve(`${packageName}/package.json`)));
    } catch {
      // try next anchor
    }
  }
  return '';
}

function resolveNodePackage(fromDir) {
  for (const start of uniqueStarts(fromDir)) {
    const walked = walkUpFor(start, NODE_REL);
    if (walked) {
      return { path: walked, warning: '' };
    }
  }
  for (const start of uniqueStarts(fromDir)) {
    const resolved = resolveViaRequire(start, '@shedcollective/neat-os');
    if (resolved) {
      return { path: resolved, warning: '' };
    }
  }
  for (const start of uniqueStarts(fromDir)) {
    const walked = walkUpFor(start, NODE_REL_DEPRECATED);
    if (walked) {
      return {
        path: walked,
        warning: 'node_modules/@shedcollective/shed-os is deprecated; install @shedcollective/neat-os',
      };
    }
  }
  for (const start of uniqueStarts(fromDir)) {
    const resolved = resolveViaRequire(start, '@shedcollective/shed-os');
    if (resolved) {
      return {
        path: resolved,
        warning: 'node_modules/@shedcollective/shed-os is deprecated; install @shedcollective/neat-os',
      };
    }
  }
  return { path: '', warning: '' };
}

function resolveVendor(fromDir) {
  for (const start of uniqueStarts(fromDir)) {
    const walked = walkUpFor(start, VENDOR_REL);
    if (walked) {
      return { path: walked, warning: '' };
    }
  }
  for (const start of uniqueStarts(fromDir)) {
    const walked = walkUpFor(start, VENDOR_REL_DEPRECATED);
    if (walked) {
      return {
        path: walked,
        warning: 'vendor/shedcollective/shed-os is deprecated; require shedcollective/neat-os',
      };
    }
  }
  return { path: '', warning: '' };
}

function resolveSibling(fromDir) {
  const parent = path.resolve(fromDir, '..');
  if (parent === path.resolve(fromDir)) {
    return { path: '', warning: '' };
  }
  const current = path.join(parent, 'neat-os');
  if (isOsTree(current)) {
    return { path: realpathIfExists(current), warning: '' };
  }
  const deprecated = path.join(parent, 'shed-os');
  if (isOsTree(deprecated)) {
    return {
      path: realpathIfExists(deprecated),
      warning: 'sibling ../shed-os is deprecated; clone the tree as ../neat-os',
    };
  }
  return { path: '', warning: '' };
}

function readEnvPath(env, name) {
  const raw = String(env[name] || '').trim();
  if (!raw) {
    return { path: '', warning: '' };
  }
  if (!path.isAbsolute(raw)) {
    return {
      path: '',
      warning: `${name} is set but is not an absolute path (${raw}); skipping`,
    };
  }
  if (!isOsTree(raw)) {
    return {
      path: '',
      warning: `${name} is set but is not a valid neat-os tree (${raw}); skipping`,
    };
  }
  return { path: realpathIfExists(raw), warning: '' };
}

function resolveEnvRoot(env = process.env) {
  const neat = readEnvPath(env, 'NEAT_OS_ROOT');
  if (neat.path) {
    return neat;
  }
  const shed = readEnvPath(env, 'SHED_OS_ROOT');
  const warnings = [neat.warning, shed.warning].filter(Boolean);
  if (shed.path) {
    warnings.unshift('SHED_OS_ROOT is deprecated; set NEAT_OS_ROOT');
    return { path: shed.path, warning: warnings.join(' ') };
  }
  return { path: '', warning: warnings.join(' ') };
}

function skillsDirFor(root, mode) {
  if (!root || mode === 'vendor') {
    return '';
  }
  try {
    const neatOs = require(root);
    if (neatOs && neatOs.skillsDir && fs.existsSync(neatOs.skillsDir)) {
      return neatOs.skillsDir;
    }
  } catch {
    // fall through to skills/ on disk
  }
  const skills = path.join(root, 'skills');
  return fs.existsSync(skills) ? skills : '';
}

function resolveConsume(fromDir = process.cwd(), env = process.env) {
  const target = path.resolve(fromDir);
  const envHit = resolveEnvRoot(env);
  const nodeHit = resolveNodePackage(target);
  const vendorHit = resolveVendor(target);
  const siblingHit = resolveSibling(target);
  const checkout = isOsTree(target) ? realpathIfExists(target) : '';

  let mode = 'missing';
  let root = '';
  let deprecatedWarning = '';

  if (envHit.path) {
    mode = 'env';
    root = envHit.path;
  } else if (nodeHit.path) {
    mode = 'node_modules';
    root = nodeHit.path;
    deprecatedWarning = nodeHit.warning;
  } else if (vendorHit.path) {
    mode = 'vendor';
    root = vendorHit.path;
    deprecatedWarning = vendorHit.warning;
  } else if (siblingHit.path) {
    mode = 'sibling';
    root = siblingHit.path;
    deprecatedWarning = siblingHit.warning;
  } else if (checkout) {
    mode = 'checkout';
    root = checkout;
  }

  const envWarning = [envHit.warning, deprecatedWarning].filter(Boolean).join('\n');

  return {
    target,
    mode,
    root,
    skillsDir: skillsDirFor(root, mode),
    envRoot: envHit.path,
    envWarning,
    checkout,
    nodePkg: nodeHit.path,
    vendor: vendorHit.path,
    sibling: siblingHit.path,
  };
}

function formatConsumeReport(result) {
  const lines = [
    `target:       ${result.target}`,
    `mode:         ${result.mode}`,
    `root:         ${result.root}`,
    `NEAT_OS_ROOT: ${result.envRoot}`,
    `sibling:      ${result.sibling}`,
    `checkout:     ${result.checkout}`,
    `node_modules: ${result.nodePkg}`,
    `vendor:       ${result.vendor}`,
    `skills_dir:   ${result.skillsDir}`,
  ];
  if (result.mode === 'vendor') {
    lines.push(
      'hint: Composer vendor/ is PHP metadata only. Resolve skills via NEAT_OS_ROOT, node_modules/@shedcollective/neat-os after file: or github:shedcollective/neat-os#tag, or sibling ../neat-os.',
    );
  }
  if (result.mode === 'missing') {
    lines.push(
      'hint: Do not search the public web for “neat-os init” or invent install steps.',
    );
    lines.push(
      'hint: IDE / single clone — pin git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z in package.json, then npm install. When that package is already in the lockfile, npm update @shedcollective/neat-os.',
    );
    lines.push(
      'hint: Cloud / multi-repo — sibling ../neat-os or NEAT_OS_ROOT, or npm install ../neat-os (file:).',
    );
    lines.push(
      'hint: PHP: Composer VCS → vendor/shedcollective/neat-os (metadata only). Skills still need Node git pin or a checkout.',
    );
    lines.push(
      'hint: Do not copy skills into the client. Install from git (file: sibling or github:#tag), not a Packages registry.',
    );
  }
  return `${lines.join('\n')}\n`;
}

function printUsage() {
  process.stdout.write(`Usage: resolve-consume.js [TARGET_DIR]

Report the neat-os consume mode for TARGET_DIR (default: current git root).

Locked order (stop at the first hit):
  1. NEAT_OS_ROOT     absolute env path to a valid neat-os tree
  2. node_modules     @shedcollective/neat-os (walk up or require.resolve)
  3. vendor           shedcollective/neat-os (Composer; PHP metadata only)
  4. sibling          ../neat-os
  5. checkout         TARGET itself is a neat-os tree

SHED_OS_ROOT, node_modules/@shedcollective/shed-os, vendor/shedcollective/shed-os,
and sibling ../shed-os still resolve. Each prints a deprecation warning.

Modes: env | node_modules | vendor | sibling | checkout | missing

Do not search the public web for “neat-os init”.
Vendoring means node_modules/ or vendor/, not a copy of skills into the client.
`);
}

function defaultTarget() {
  const { execFileSync } = require('child_process');
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return '';
  }
}

function main(argv) {
  let target = '';
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      printUsage();
      return 0;
    }
    if (arg === '--') {
      continue;
    }
    if (arg.startsWith('-')) {
      process.stderr.write(`error: unknown option: ${arg}\n`);
      printUsage();
      return 2;
    }
    if (target) {
      process.stderr.write(`error: unexpected argument: ${arg}\n`);
      return 2;
    }
    target = arg;
  }

  if (!target) {
    target = defaultTarget();
  }
  if (!target) {
    process.stderr.write('error: not inside a git repository and no TARGET_DIR given\n');
    return 2;
  }
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    process.stderr.write(`error: target is not a directory: ${target}\n`);
    return 2;
  }

  target = fs.realpathSync(target);

  const { execFileSync } = require('child_process');
  try {
    execFileSync('git', ['-C', target, 'rev-parse', '--is-inside-work-tree'], {
      stdio: 'ignore',
    });
  } catch {
    process.stderr.write(`error: ${target} is not a git repository\n`);
    return 2;
  }

  const result = resolveConsume(target);
  if (result.envWarning) {
    process.stderr.write(`warning: ${result.envWarning}\n`);
  }
  process.stdout.write(formatConsumeReport(result));
  return result.mode === 'missing' ? 1 : 0;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}

module.exports = {
  resolveConsume,
  formatConsumeReport,
  isOsTree,
  main,
};
