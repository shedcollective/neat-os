#!/usr/bin/env node
'use strict';

/**
 * Structural checks: required paths, file hygiene, frontmatter, package
 * consistency, and index ↔ files agreement (ADRs, principles).
 * No prose pinning here — see check-policy.js for the short locked list.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function fail(msg) {
  console.error(`check-structure: ${msg}`);
  process.exit(1);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const required = [
  'README.md',
  'AGENTS.md',
  'composer.json',
  'package.json',
  'index.js',
  'index.d.ts',
  '.editorconfig',
  '.agents/README.md',
  'principles/README.md',
  'principles/kaizen.md',
  'principles/determinism.md',
  'principles/parallelism.md',
  'conventions/README.md',
  'conventions/git.md',
  'conventions/tickets.md',
  'conventions/ticket-content.md',
  'conventions/writing.md',
  'schema/README.md',
  'docs/README.md',
  'docs/consume.md',
  'docs/launch-skills.md',
  'docs/cursor-environments.md',
  'docs/release.md',
  'docs/faq.md',
  'docs/contributing.md',
  'docs/team-setup.md',
  'docs/decisions/README.md',
  'docs/decisions/0000-template.md',
  'skills/init/SKILL.md',
  'skills/init/scripts/copy-templates.sh',
  'skills/init/scripts/resolve-consume.sh',
  'skills/gather/SKILL.md',
  'skills/gather/scripts/light-scan.sh',
  'skills/gather/scripts/light-scan.js',
  'skills/learn/SKILL.md',
  'skills/ticket/SKILL.md',
  'templates/AGENTS.md',
  'templates/.agents/README.md',
  'templates/.agents/project.md',
  'templates/.agents/docs/.gitkeep',
  'templates/.agents/features/TEMPLATE.md',
  'templates/.agents/dependencies/pins.md',
  'templates/.agents/platforms/README.md',
  'templates/.agents/platforms/TEMPLATE.md',
  'templates/.agents/proposals/README.md',
  'stacks/nails/README.md',
  'stacks/nails/admin-uses-api.md',
  'stacks/nails/factory-not-new.md',
  'stacks/nails/fix-at-source.md',
  'stacks/nails/views-use-curly-braces.md',
  'packages/npm/package.json',
  'packages/npm/index.js',
  'packages/npm/index.d.ts',
  'packages/npm/resolve-consume.js',
  'packages/npm/README.md',
  'packages/composer/composer.json',
  'packages/composer/src/NeatOs.php',
  'packages/composer/README.md',
  'conventions/neutral-reference.md',
  'scripts/check',
  'scripts/check-structure.js',
  'scripts/check-policy.js',
  'scripts/check-neutral.js',
  'scripts/check-smoke.js',
  '.github/workflows/validate.yml',
  '.github/workflows/release-smoke.yml',
  '.github/workflows/publish-npm.yml',
];

const missing = required.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missing.length) {
  fail(`missing required paths:\n${missing.map((m) => `  - ${m}`).join('\n')}`);
}

for (const banned of ['.npmrc.example', 'scripts/validate-skeleton.js', 'skills/init/scripts/light-scan.js']) {
  if (fs.existsSync(path.join(root, banned))) {
    fail(`${banned} must not exist`);
  }
}

// Trailing newline on every tracked text file.
function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'vendor') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      continue;
    }
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

const missingNewlines = [];
for (const file of walkFiles(root)) {
  const data = fs.readFileSync(file);
  if (data.length === 0 || data[data.length - 1] !== 0x0a) {
    missingNewlines.push(path.relative(root, file));
  }
}
if (missingNewlines.length) {
  fail(`files missing a trailing newline:\n${missingNewlines.map((m) => `  - ${m}`).join('\n')}`);
}

// Skill frontmatter.
function assertFrontmatter(rel, expectedName) {
  const text = read(rel);
  if (!text.startsWith('---\n')) {
    fail(`${rel} missing YAML frontmatter`);
  }
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) {
    fail(`${rel} unterminated YAML frontmatter`);
  }
  const fm = text.slice(4, end);
  if (!new RegExp(`^name:\\s*${expectedName}\\s*$`, 'm').test(fm)) {
    fail(`${rel} frontmatter name must be ${expectedName}`);
  }
  if (!/^description:\s+\S/m.test(fm)) {
    fail(`${rel} frontmatter description missing`);
  }
}
// Every skills/<name>/SKILL.md is a mechanism; its frontmatter name must equal its
// directory. Derived from the tree so adding a skill never edits this file.
const skillsDir = path.join(root, 'skills');
const skillNames = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();
for (const name of skillNames) {
  const rel = `skills/${name}/SKILL.md`;
  if (!fs.existsSync(path.join(root, rel))) {
    fail(`${rel} missing: every skills/<name>/ directory carries a SKILL.md`);
  }
  assertFrontmatter(rel, name);
}

// ticket writes to the ticket system only (ADR-0012): no script of its own,
// and it never calls the scaffold or the evidence scan as a side effect.
if (fs.existsSync(path.join(root, 'skills/ticket/scripts'))) {
  fail('skills/ticket/ must not carry scripts: the playbook uses the runner\'s ticket tool (ADR-0012)');
}
const ticketSkill = read('skills/ticket/SKILL.md');
for (const banned of ['copy-templates.sh', 'light-scan']) {
  if (ticketSkill.includes(banned)) {
    fail(`skills/ticket/SKILL.md must not invoke ${banned} (ADR-0012)`);
  }
}
if (!/ticket-content\.md/.test(ticketSkill)) {
  fail('skills/ticket/SKILL.md must read conventions/ticket-content.md');
}
// The section list and its order are the locked shape (ADR-0012).
const ticketConvention = read('conventions/ticket-content.md');
const ticketSections = ['Title', 'Original request', 'More information needed', 'Why', 'What', 'How to replicate', 'Out of scope', 'Acceptance criteria', 'Links', 'Attachments'];
const sectionRows = [...ticketConvention.matchAll(/^\| ([A-Z][a-z ]+) \| (yes|bugs only|when useful|when the request is unclear) \|/gm)].map((m) => m[1]);
if (sectionRows.join('|') !== ticketSections.join('|')) {
  fail(`conventions/ticket-content.md sections must be, in order: ${ticketSections.join(', ')}; got ${sectionRows.join(', ') || 'none'}`);
}
if (!ticketConvention.includes('Done when')) {
  fail('conventions/ticket-content.md must lock the "Done when" acceptance criteria shape');
}
// An unclear request still becomes a ticket that names its gaps; the playbook
// must apply the rule rather than stop with a draft.
if (!/^## When the request is unclear$/m.test(ticketConvention)) {
  fail('conventions/ticket-content.md must carry a "When the request is unclear" section');
}
if (!/^## Title$/m.test(ticketConvention)) {
  fail('conventions/ticket-content.md must carry a Title section for the two title shapes (ADR-0015)');
}
if (!ticketSkill.includes('breakage')) {
  fail('skills/ticket/SKILL.md must apply the breakage title shape (ADR-0015)');
}
if (!ticketSkill.includes('More information needed')) {
  fail('skills/ticket/SKILL.md must add a More information needed section when facts are missing after asking');
}
if (!/^## Example$/m.test(ticketConvention)) {
  fail('conventions/ticket-content.md must carry an Example section for the playbook to match');
}
const ticketsSlotTemplate = read('templates/.agents/project.md');
if (!/^## Tickets$/m.test(ticketsSlotTemplate)) {
  fail('templates/.agents/project.md must carry a Tickets slot for the ticket playbook to read');
}

// Package identity and version agreement.
const rootPkg = JSON.parse(read('package.json'));
const npm = JSON.parse(read('packages/npm/package.json'));
const composer = JSON.parse(read('composer.json'));
const pkgComposer = JSON.parse(read('packages/composer/composer.json'));

if (rootPkg.name !== '@shedcollective/neat-os') {
  fail(`root package name must be @shedcollective/neat-os, got ${rootPkg.name}`);
}
if (npm.name !== rootPkg.name) {
  fail(`packages/npm name must match root (${rootPkg.name}), got ${npm.name}`);
}
if (npm.version !== rootPkg.version) {
  fail(`root version ${rootPkg.version} must match packages/npm ${npm.version}`);
}
// One release tag versions Node and Composer (docs/release.md). Composer skips a
// tag whose composer.json declares a different version, so keep them equal.
for (const [label, manifest] of [['composer.json', composer], ['packages/composer/composer.json', pkgComposer]]) {
  if (manifest.version !== undefined && manifest.version !== rootPkg.version) {
    fail(`${label} version ${manifest.version} must match package.json ${rootPkg.version} (one release tag versions both)`);
  }
}
for (const [label, pkg] of [['root', rootPkg], ['packages/npm', npm]]) {
  if (pkg.publishConfig && /npm\.pkg\.github\.com/.test(pkg.publishConfig.registry || '')) {
    fail(`${label} package.json must not publishConfig to GitHub Packages while publish is paused (ADR-0017)`);
  }
}
if (!rootPkg.scripts || !/scripts\/check/.test(rootPkg.scripts.test || '')) {
  fail('root package.json "test" must run scripts/check');
}
if (composer.name !== 'shedcollective/neat-os' || pkgComposer.name !== 'shedcollective/neat-os') {
  fail('composer package name must be shedcollective/neat-os in both composer.json files');
}

const fromRoot = require(path.join(root, 'index.js'));
const fromNpm = require(path.join(root, 'packages/npm/index.js'));
if (fromRoot !== fromNpm) {
  fail('root index.js must re-export packages/npm (same module.exports object)');
}
if (fromRoot.version !== npm.version) {
  fail(`packages/npm/index.js version ${fromRoot.version} must match package.json ${npm.version}`);
}
const php = read('packages/composer/src/NeatOs.php');
if (!php.includes(`public const VERSION = '${rootPkg.version}'`)) {
  fail(`NeatOs::VERSION must match package.json ${rootPkg.version}`);
}
for (const key of ['skillsDir', 'templatesDir', 'principlesDir', 'conventionsDir']) {
  if (!fs.existsSync(fromRoot[key])) {
    fail(`${key} does not exist: ${fromRoot[key]}`);
  }
}
if (typeof fromRoot.resolveConsume !== 'function') {
  fail('@shedcollective/neat-os must export resolveConsume()');
}
for (const [label, pkg] of [['root', rootPkg], ['packages/npm', npm]]) {
  if (!Array.isArray(pkg.files) || !pkg.files.includes('stacks')) {
    fail(`${label} package.json files must include stacks so a published package ships stack packs (ADR-0017)`);
  }
}
if (!/['"]stacks['"]/.test(read('scripts/stage-npm.js'))) {
  fail('scripts/stage-npm.js must stage stacks into packages/npm (ADR-0017)');
}

// publish-npm.yml stays paused. The licence is MIT (ADR-0017).
const publishPath = path.join(root, '.github/workflows/publish-npm.yml');
if (fs.existsSync(publishPath)) {
  const publishYml = fs.readFileSync(publishPath, 'utf8');
  if (!/paused/i.test(publishYml) || publishYml.includes('types: [published]') || /^\s+npm publish\s*$/m.test(publishYml)) {
    fail('publish-npm.yml must stay paused: no release trigger, no npm publish (ADR-0017)');
  }
}

// SHA and tag install smokes (ADR-0010). Do not weaken these.
// pull_request github.sha is the ephemeral merge commit. npm cannot check it out.
const validateYml = read('.github/workflows/validate.yml');
if (!validateYml.includes('github.event.pull_request.head.sha || github.sha')) {
  fail('validate.yml must npm install the pull request head SHA, and github.sha on push, into a scratch consumer (ADR-0010)');
}
const checkSh = read('scripts/check');
const neutralAt = checkSh.indexOf('scripts/check-neutral.js');
const policyAt = checkSh.indexOf('scripts/check-policy.js');
const smokeAt = checkSh.indexOf('scripts/check-smoke.js');
if (neutralAt === -1 || !(policyAt < neutralAt && neutralAt < smokeAt)) {
  fail('scripts/check must run scripts/check-neutral.js after policy and before smoke (ADR-0016)');
}
if (!validateYml.includes('GITHUB_WORKSPACE')) {
  fail('validate.yml must keep the sibling file install smoke');
}
const releaseSmokeYml = read('.github/workflows/release-smoke.yml');
if (!/^\s*release:\s*$/m.test(releaseSmokeYml) || !/published/.test(releaseSmokeYml)) {
  fail('release-smoke.yml must run on release published (ADR-0010)');
}
if (!/skillsDir/.test(releaseSmokeYml) || !/node_modules/.test(releaseSmokeYml)) {
  fail('release-smoke.yml must assert skillsDir exists and resolveConsume mode is node_modules (ADR-0010)');
}
if (/^\s+npm publish\s*$/m.test(releaseSmokeYml)) {
  fail('release-smoke.yml must not npm publish (ADR-0017)');
}

// Workflow YAML: an unquoted colon inside a `name:` value is a parse error that
// fails every run in 0s with no job log (happened on develop, 8 Sep 2026).
const workflowsDir = path.join(root, '.github/workflows');
for (const file of fs.readdirSync(workflowsDir).filter((name) => /\.ya?ml$/.test(name))) {
  const lines = fs.readFileSync(path.join(workflowsDir, file), 'utf8').split('\n');
  lines.forEach((line, i) => {
    const match = /^\s*(?:-\s+)?name:\s+(.+)$/.exec(line);
    if (match && !/^['"]/.test(match[1]) && /:(\s|$)/.test(match[1])) {
      fail(`.github/workflows/${file}:${i + 1} unquoted colon in name value breaks YAML: ${line.trim()}`);
    }
  });
}

// ADR index ↔ files.
const adrDir = path.join(root, 'docs/decisions');
const adrFiles = fs
  .readdirSync(adrDir)
  .filter((name) => /^\d{4}-.+\.md$/.test(name) && name !== '0000-template.md')
  .sort();
const adrIndex = read('docs/decisions/README.md');
for (const file of adrFiles) {
  if (!adrIndex.includes(`(${file})`)) {
    fail(`docs/decisions/README.md does not list ${file}`);
  }
  const body = read(`docs/decisions/${file}`);
  if (!/^\*\*Status:\*\*\s+(Proposed|Accepted|Superseded by \d{4}|Deprecated)/m.test(body)) {
    fail(`docs/decisions/${file} must declare a Status line from the template`);
  }
  if (!/^\*\*Date:\*\*\s+\d{4}-\d{2}-\d{2}/m.test(body)) {
    fail(`docs/decisions/${file} must declare a Date line`);
  }
}
for (const link of adrIndex.matchAll(/\((\d{4}-[^)]+\.md)\)/g)) {
  if (!fs.existsSync(path.join(adrDir, link[1]))) {
    fail(`docs/decisions/README.md links missing file ${link[1]}`);
  }
}

// Commit shape stays in conventions/git.md (ADR-0014). The policy list is
// already at its cap of 10, so the sentences are asserted here.
const gitConvention = read('conventions/git.md');
for (const sentence of [
  'Each commit is one concern',
  'what changed and why',
  'that documentation is the first commit',
  'follow the change from the first commit to the last',
  'does not stand on its own',
]) {
  if (!gitConvention.includes(sentence)) {
    fail(`conventions/git.md must lock commit shape (ADR-0014): missing "${sentence}"`);
  }
}

// Principles index ↔ leaves.
const goals = new Set(['README.md', 'kaizen.md', 'determinism.md', 'parallelism.md']);
const principleDir = path.join(root, 'principles');
const leaves = fs.readdirSync(principleDir).filter((name) => name.endsWith('.md') && !goals.has(name)).sort();
const principleIndex = read('principles/README.md');
for (const leaf of leaves) {
  if (!principleIndex.includes(`(${leaf})`)) {
    fail(`principles/README.md does not index ${leaf}`);
  }
  const body = read(`principles/${leaf}`);
  for (const heading of ['**Applies when**', '**The decision it changes.**', '**Source.**']) {
    if (!body.includes(heading)) {
      fail(`principles/${leaf} missing ${heading} (see schema/README.md)`);
    }
  }
}
for (const link of principleIndex.matchAll(/\(([a-z0-9-]+\.md)\)/g)) {
  if (!fs.existsSync(path.join(principleDir, link[1]))) {
    fail(`principles/README.md links missing leaf ${link[1]}`);
  }
}
if (leaves.length > 13) {
  fail(`principles: ${leaves.length} leaves; keep the set small (≤ 13, ADR-0018) or justify in an ADR`);
}

// Conventions index ↔ files.
const conventionsIndex = read('conventions/README.md');
for (const name of fs.readdirSync(path.join(root, 'conventions')).filter((n) => n.endsWith('.md') && n !== 'README.md')) {
  if (!conventionsIndex.includes(`(${name})`)) {
    fail(`conventions/README.md does not list ${name}`);
  }
}

// Stack packs: each stacks/<name>/ README indexes sibling .md files.
const stacksDir = path.join(root, 'stacks');
if (fs.existsSync(stacksDir)) {
  for (const name of fs.readdirSync(stacksDir).sort()) {
    const packDir = path.join(stacksDir, name);
    if (!fs.statSync(packDir).isDirectory()) {
      continue;
    }
    const files = fs.readdirSync(packDir).filter((item) => item.endsWith('.md')).sort();
    if (!files.includes('README.md')) {
      fail(`stacks/${name}/ missing README.md`);
    }
    const index = read(`stacks/${name}/README.md`);
    for (const file of files.filter((item) => item !== 'README.md')) {
      if (!index.includes(`(${file})`)) {
        fail(`stacks/${name}/README.md does not index ${file}`);
      }
    }
  }
}

// Docs index ↔ top-level pages (decisions/ has its own index).
const docsIndex = read('docs/README.md');
for (const name of fs.readdirSync(path.join(root, 'docs')).filter((n) => n.endsWith('.md') && n !== 'README.md')) {
  if (!docsIndex.includes(`(${name})`)) {
    fail(`docs/README.md does not list ${name}`);
  }
}

// ADR-0008: repo markdown never links to Notion.
const notionUrl = /https?:\/\/([a-z0-9.-]+\.)?notion\.(so|site|com)\b/i;
const notionHits = [];
for (const file of walkFiles(root)) {
  if (!file.endsWith('.md')) {
    continue;
  }
  if (notionUrl.test(fs.readFileSync(file, 'utf8'))) {
    notionHits.push(path.relative(root, file));
  }
}
if (notionHits.length) {
  fail(`ADR-0008: Notion URLs in:\n${notionHits.map((m) => `  - ${m}`).join('\n')}`);
}

console.log('check-structure OK');
