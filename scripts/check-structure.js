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
  'templates/ops/bot-skill.md',
  'templates/ops/bids-register.md',
  'templates/ops/bid-submission.md',
  'templates/agent/passport.md',
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
  '.github/workflows/prepare-release.yml',
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
// The section list and its order are the locked shape (ADR-0012, ADR-0020).
const ticketConvention = read('conventions/ticket-content.md');
const ticketSections = ['Title', 'More information needed', 'Why', 'What', 'How to replicate', 'Out of scope', 'Acceptance criteria', 'Links', 'Attachments'];
const sectionRows = [...ticketConvention.matchAll(/^\| ([A-Z][a-z ]+) \| (yes|bugs only|when useful|when the request is unclear) \|/gm)].map((m) => m[1]);
if (sectionRows.join('|') !== ticketSections.join('|')) {
  fail(`conventions/ticket-content.md sections must be, in order: ${ticketSections.join(', ')}; got ${sectionRows.join(', ') || 'none'}`);
}
// A ticket records only the decided outcome (ADR-0020). The three sentences
// live in the convention and the playbook. The old section name must not return.
const decidedOutcomeSentences = [
  'final decided outcome, stated as fact',
  'original request text, meeting discussion, options considered, attributions',
  'rewrite the ticket body to the new decision instead of appending history',
];
for (const rel of ['conventions/ticket-content.md', 'skills/ticket/SKILL.md']) {
  const text = rel === 'conventions/ticket-content.md' ? ticketConvention : ticketSkill;
  for (const sentence of decidedOutcomeSentences) {
    if (!text.includes(sentence)) {
      fail(`${rel} must lock the decided-outcome rule (ADR-0020): missing "${sentence}"`);
    }
  }
  if (text.includes('Original request')) {
    fail(`${rel} must not tell writers to keep an Original request section (ADR-0020)`);
  }
}
if (read('docs/launch-skills.md').includes('Original request')) {
  fail('docs/launch-skills.md must not list an Original request section (ADR-0020)');
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
const githubPackagesRegistry = 'https://npm.pkg.github.com';
for (const [label, pkg] of [['root', rootPkg], ['packages/npm', npm]]) {
  const registry = String((pkg.publishConfig && pkg.publishConfig.registry) || '').replace(/\/$/, '');
  if (registry !== githubPackagesRegistry) {
    fail(`${label} package.json publishConfig.registry must be ${githubPackagesRegistry} (ADR-0019)`);
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
  if (!Array.isArray(pkg.files) || !pkg.files.includes('stacks') || !pkg.files.includes('skills')) {
    fail(`${label} package.json files must include stacks and skills so a published package ships them (ADR-0017)`);
  }
}
if (!/['"]stacks['"]/.test(read('scripts/stage-npm.js'))) {
  fail('scripts/stage-npm.js must stage stacks into packages/npm (ADR-0017)');
}

// publish-npm.yml publishes to GitHub Packages on a Release. Nothing else may (ADR-0019).
const publishYml = read('.github/workflows/publish-npm.yml');
if (/paused/i.test(publishYml)) {
  fail('publish-npm.yml must not stay paused (ADR-0019)');
}
if (!/types:\s*\[published\]/.test(publishYml)) {
  fail('publish-npm.yml must run when a Release is published (ADR-0019)');
}
if (!/packages:\s*write/.test(publishYml)) {
  fail('publish-npm.yml must set packages: write for GITHUB_TOKEN (ADR-0019)');
}
if (!/npm\.pkg\.github\.com/.test(publishYml)) {
  fail('publish-npm.yml must publish to https://npm.pkg.github.com (ADR-0019)');
}
if (/registry\.npmjs\.org/.test(publishYml)) {
  fail('publish-npm.yml must not publish to the public npm registry (ADR-0019)');
}
if (!/secrets\.GITHUB_TOKEN/.test(publishYml)) {
  fail('publish-npm.yml must authenticate npm with GITHUB_TOKEN (ADR-0019)');
}
if (!/^\s+npm publish\s*$/m.test(publishYml)) {
  fail('publish-npm.yml must run npm publish (ADR-0019)');
}
if (!/npm pack --dry-run/.test(publishYml) || !publishYml.includes('skills/') || !publishYml.includes('stacks/')) {
  fail('publish-npm.yml must verify the tarball includes skills/ and stacks/ (ADR-0019)');
}
const mainGuard = 'git merge-base --is-ancestor';
const mainGuardError = 'Publish the Release targeting main after merging release/X.Y.Z.';
if (!publishYml.includes('fetch-depth: 0') || !publishYml.includes(mainGuard) || !publishYml.includes('origin/main') || !publishYml.includes(mainGuardError)) {
  fail('publish-npm.yml must refuse a release tag that is not reachable from origin/main, after a full fetch');
}
if (!publishYml.includes('does not match package.json version')) {
  fail('publish-npm.yml must fail when the tag does not match package.json version');
}
const publishAt = publishYml.indexOf('npm publish');
if (publishAt === -1 || publishYml.indexOf(mainGuard) > publishAt) {
  fail('publish-npm.yml must check the tag is on main before npm publish');
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
if (/^\s+npm publish\s*$/m.test(releaseSmokeYml) || /registry\.npmjs\.org/.test(releaseSmokeYml)) {
  fail('release-smoke.yml must not npm publish or use the public npm registry (ADR-0019)');
}
if (!releaseSmokeYml.includes('fetch-depth: 0') || !releaseSmokeYml.includes(mainGuard) || !releaseSmokeYml.includes('origin/main') || !releaseSmokeYml.includes(mainGuardError)) {
  fail('release-smoke.yml must refuse a release tag that is not reachable from origin/main, after a full fetch');
}
const prepareYml = read('.github/workflows/prepare-release.yml');
if (!/workflow_dispatch:/.test(prepareYml) || !/inputs:/.test(prepareYml)) {
  fail('prepare-release.yml must be workflow_dispatch with a version input');
}
if (!/contents:\s*write/.test(prepareYml) || !/pull-requests:\s*write/.test(prepareYml)) {
  fail('prepare-release.yml must set contents: write and pull-requests: write');
}
if (!prepareYml.includes('--draft') || !prepareYml.includes('--target main')) {
  fail('prepare-release.yml must create a draft Release targeting main');
}
if (/gh pr merge/.test(prepareYml) || /--draft=false/.test(prepareYml)) {
  fail('prepare-release.yml must not merge or publish the Release');
}
if (!prepareYml.includes('docs/release.md') || !prepareYml.includes('release-prep')) {
  fail('prepare-release.yml must point at the release-prep pull request when develop is not at that version');
}
if (!prepareYml.includes('isDraft') || !prepareYml.includes('targetCommitish')) {
  fail('prepare-release.yml must confirm the Release stays a draft targeted at the branch main');
}

// Workflow YAML: an unquoted colon inside a `name:` value is a parse error that
// fails every run in 0s with no job log (happened on develop, 8 Sep 2026).
const workflowsDir = path.join(root, '.github/workflows');
for (const file of fs.readdirSync(workflowsDir).filter((name) => /\.ya?ml$/.test(name))) {
  const lines = fs.readFileSync(path.join(workflowsDir, file), 'utf8').split('\n');
  if (file !== 'publish-npm.yml') {
    const yml = lines.join('\n');
    if (/npm publish/.test(yml) || /registry\.npmjs\.org/.test(yml)) {
      fail(`.github/workflows/${file} must not npm publish or use the public npm registry (ADR-0019)`);
    }
  }
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
  if (!/^\*\*Status:\*\*\s+(Proposed|Accepted|Partially superseded by \d{4}|Superseded by \d{4}|Deprecated)/m.test(body)) {
    fail(`docs/decisions/${file} must declare a Status line from the template`);
  }
  if (!/^\*\*Date:\*\*\s+\d{4}-\d{2}-\d{2}/m.test(body)) {
    fail(`docs/decisions/${file} must declare a Date line`);
  }
}
if (!/^\*\*Status:\*\*\s+Partially superseded by 0019\s*$/m.test(read('docs/decisions/0017-consume-via-github-packages.md'))) {
  fail('docs/decisions/0017 must stay Partially superseded by 0019 (ADR-0019 replaces only the pause)');
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

// morning-brief composes one message in a fixed section order (GH-29).
const morningBrief = read('skills/morning-brief/SKILL.md');
const morningSections = ['Needs you', 'Today', 'Meetings', 'Health', 'Pipeline'];
const morningAt = morningSections.map((name) => morningBrief.indexOf(`**${name}**`));
if (morningAt.some((i) => i < 0) || morningAt.some((v, i) => i > 0 && v < morningAt[i - 1])) {
  fail(`skills/morning-brief/SKILL.md must compose sections in order: ${morningSections.join(', ')}`);
}
for (const sentence of [
  'adds no new facts',
  'does not delay that alert',
  'quiet-when-empty',
  'all green',
]) {
  if (!morningBrief.includes(sentence)) {
    fail(`skills/morning-brief/SKILL.md must lock the morning brief rule: missing "${sentence}"`);
  }
}
if (!read('skills/daily-digest/SKILL.md').includes('morning-brief')) {
  fail('skills/daily-digest/SKILL.md must point morning messages at morning-brief');
}
const agencyOps = read('docs/agency-ops.md');
if (!agencyOps.includes('morning-brief')) {
  fail('docs/agency-ops.md must list morning-brief alongside daily-digest');
}
if (!agencyOps.includes('Needs you, Today, Meetings, Health, Pipeline')) {
  fail('docs/agency-ops.md must state the morning-brief section order');
}
if (!read('skills/meeting-prep/SKILL.md').includes('morning-brief')) {
  fail('skills/meeting-prep/SKILL.md must point scheduled briefs at morning-brief');
}

// Wrapper templates pin a release tag, never a branch (ADR-0021).
// check-policy.js is at its cap of ten, so this lives here with the
// release-tag-on-main guard rather than as a prose policy.
function wrapperPinRefAllowed(ref) {
  if (ref === 'vX.Y.Z') return true;
  return /^v\d+\.\d+\.\d+$/.test(ref);
}

function githubBlobRefs(text) {
  const refs = [];
  const re = /github\.com\/shedcollective\/neat-os\/(?:blob|raw|tree)\/([^/#?\s)]+)/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    refs.push(match[1]);
  }
  return refs;
}

for (const [ref, allowed] of [
  ['v0.5.0', true],
  ['vX.Y.Z', true],
  ['v1.2.3', true],
  ['develop', false],
  ['main', false],
  ['master', false],
  ['HEAD', false],
  ['release/0.5.0', false],
]) {
  if (wrapperPinRefAllowed(ref) !== allowed) {
    fail(`wrapper pin classifier (ADR-0021): ${ref} should be ${allowed ? 'allowed' : 'forbidden'}`);
  }
}

const wrapperTemplate = read('templates/ops/bot-skill.md');
if (!wrapperTemplate.includes('say so and stop')) {
  fail('templates/ops/bot-skill.md must stop when the pin is a branch (ADR-0021)');
}
if (!wrapperTemplate.includes('blob/vX.Y.Z/')) {
  fail('templates/ops/bot-skill.md must pin GitHub playbook links to vX.Y.Z (ADR-0021)');
}
if (/Pin `main` or a release tag/.test(wrapperTemplate)) {
  fail('templates/ops/bot-skill.md must not treat main as a first-class pin (ADR-0021)');
}
if (!wrapperTemplate.includes('<neat-os-path>')) {
  fail('templates/ops/bot-skill.md must read playbooks from <neat-os-path> (ADR-0022)');
}
if (!wrapperTemplate.includes('neat-os is not at <neat-os-path>. Stop.')) {
  fail('templates/ops/bot-skill.md must stop when <neat-os-path> is missing (ADR-0022)');
}
if (!wrapperTemplate.includes('is not at vX.Y.Z. Stop.')) {
  fail('templates/ops/bot-skill.md must stop when the checkout is not the pin (ADR-0022)');
}
if (!wrapperTemplate.includes('issue #15')) {
  fail('templates/ops/bot-skill.md must leave how the shared path is populated to issue #15 (ADR-0022)');
}

const wrapperPinFiles = ['templates/ops/bot-skill.md', 'templates/agent/passport.md'];
for (const rel of wrapperPinFiles) {
  const text = rel === 'templates/ops/bot-skill.md' ? wrapperTemplate : read(rel);
  const refs = githubBlobRefs(text);
  for (const ref of refs) {
    if (!wrapperPinRefAllowed(ref)) {
      fail(`${rel} pins a branch or non-tag ref "${ref}"; pin a release tag (ADR-0021)`);
    }
  }
}
if (!githubBlobRefs(wrapperTemplate).length) {
  fail('templates/ops/bot-skill.md must contain a GitHub blob pin (ADR-0021)');
}

const passportTemplate = read('templates/agent/passport.md');
for (const heading of ['## Job', '## Never', '## Human gates', '## Sources', '## Skills', '## Routines', '## Day file', '## Pin', '## Review']) {
  if (!passportTemplate.includes(heading)) {
    fail(`templates/agent/passport.md missing ${heading}`);
  }
}
for (const kind of ['OS playbook', 'passport enhancement', 'bot-only']) {
  if (!passportTemplate.includes(kind)) {
    fail(`templates/agent/passport.md Skills table must name kind "${kind}"`);
  }
}
if (!passportTemplate.includes('Install only the rows whose Owner is this passport\'s owner')) {
  fail('templates/agent/passport.md must install routines for the owner only');
}
if (!passportTemplate.includes('Skip a row when a wrapper for that triple already exists')) {
  fail('templates/agent/passport.md must skip duplicate owner-name-schedule routines');
}
if (!/private operations record/.test(passportTemplate) || !/never in neat-os/.test(passportTemplate)) {
  fail('templates/agent/passport.md must say filled passports live in the private operations record, never in neat-os');
}
if (!passportTemplate.includes('Pin a release tag')) {
  fail('templates/agent/passport.md Pin must require a release tag (ADR-0021)');
}
if (!/^## Team bots$/m.test(read('docs/team-setup.md'))) {
  fail('docs/team-setup.md must say every team bot has a bot passport before it runs a routine');
}
if (!read('docs/team-setup.md').includes('before it runs a routine')) {
  fail('docs/team-setup.md must require a bot passport before a team bot runs a routine');
}

const routineSettings = read('conventions/routine-settings.md');
for (const sentence of [
  'Pin a release tag',
  '`main` is a stopgap only',
  '`develop` and other branches never',
]) {
  if (!routineSettings.includes(sentence)) {
    fail(`conventions/routine-settings.md must lock wrapper pins (ADR-0021): missing "${sentence}"`);
  }
}
if (/Pin `main` or a release tag/.test(routineSettings)) {
  fail('conventions/routine-settings.md must not treat main as a first-class pin (ADR-0021)');
}

if (!routineSettings.includes('<neat-os-path>')) {
  fail('conventions/routine-settings.md must name <neat-os-path> (ADR-0022)');
}
if (!routineSettings.includes('issue #15')) {
  fail('conventions/routine-settings.md must leave how the shared path is populated to issue #15 (ADR-0022)');
}

const consumeDocs = read('docs/consume.md');
if (!/^## Move a wrapper pin$/m.test(consumeDocs)) {
  fail('docs/consume.md must document how to bump a wrapper pin (ADR-0021)');
}
for (const sentence of [
  'one pull request for that wrapper',
  'Pick one wrapper as the canary',
  'revert that pull request to roll back',
]) {
  if (!consumeDocs.includes(sentence)) {
    fail(`docs/consume.md must lock the wrapper upgrade path (ADR-0021): missing "${sentence}"`);
  }
}
if (!consumeDocs.includes('<neat-os-path>')) {
  fail('docs/consume.md must say wrappers read from <neat-os-path> (ADR-0022)');
}

const burndownSkill = read('skills/daily-burndown/SKILL.md');
if (!burndownSkill.includes('OS does not forbid named top-level sections')) {
  fail('skills/daily-burndown/SKILL.md must allow passport-named day-file sections');
}
const enhanceSkill = read('skills/enhance-daily-update/SKILL.md');
if (!enhanceSkill.includes('OS does not forbid named top-level sections')) {
  fail('skills/enhance-daily-update/SKILL.md must allow passport-named day-file sections');
}
if (enhanceSkill.includes('Do not add `## Front end`')) {
  fail('skills/enhance-daily-update/SKILL.md must not forbid named top-level sections');
}

const bidsRegister = read('skills/bids-register/SKILL.md');
for (const sentence of [
  'bids/<yyyy-mm-dd>-<buyer-slug>-<ref>/',
  'submission.md',
  'idempotent',
  'Never commit credentials, portal logins, or tokens',
  'Never commit a full financial or accounts package',
  'Never commit the zip',
  'superseded',
  'operations lead',
  'There is no separate new-business agent',
]) {
  if (!bidsRegister.includes(sentence)) {
    fail(`skills/bids-register/SKILL.md must lock the bids register rule: missing "${sentence}"`);
  }
}
if (!read('templates/ops/bid-submission.md').includes('Zip sha256')) {
  fail('templates/ops/bid-submission.md must record the zip sha256');
}

for (const rel of [
  'skills/finance-client-backfill/SKILL.md',
  'skills/finance-client-sync/SKILL.md',
  'skills/finance-lookup/SKILL.md',
]) {
  const text = read(rel);
  if (!text.includes('<accounting-tool>') || !text.includes('<ACCOUNTING_TOKEN_ENV>') || !text.includes('<accounting-account>')) {
    fail(`${rel} must leave the accounting tool, token, and account to the passport`);
  }
  if (!text.includes('Director only')) {
    fail(`${rel} must be usable by any director and refuse another director's account`);
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
