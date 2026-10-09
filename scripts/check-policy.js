#!/usr/bin/env node
'use strict';

/**
 * Policy lint: a short, declared list of prose invariants, each backed by an
 * ADR in docs/decisions/. This is the only place neat-os pins wording.
 * Add an entry only with an ADR; prefer a structural check when one is possible
 * (principles/encode-lessons-in-structure.md).
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function listMarkdownUnder(rel) {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) {
    return [];
  }
  const out = [];
  const walk = (current, prefix) => {
    for (const name of fs.readdirSync(current).sort()) {
      const full = path.join(current, name);
      const next = prefix ? `${prefix}/${name}` : name;
      if (fs.statSync(full).isDirectory()) {
        walk(full, next);
      } else if (name.endsWith('.md')) {
        out.push(`${rel}/${next}`);
      }
    }
  };
  walk(dir, '');
  return out;
}

const SKILLS = ['skills/init/SKILL.md', 'skills/gather/SKILL.md', 'skills/learn/SKILL.md', 'skills/ticket/SKILL.md'];
const DOC_PAGES = fs
  .readdirSync(path.join(root, 'docs'))
  .filter((name) => name.endsWith('.md'))
  .map((name) => `docs/${name}`);
const AGENT_DOCS = ['README.md', 'AGENTS.md', ...SKILLS, 'templates/AGENTS.md', 'templates/.agents/README.md', 'templates/.agents/project.md', 'schema/README.md', ...DOC_PAGES];

const policies = [
  {
    id: 'no-packages-registry-as-install-path',
    adr: '0017',
    check() {
      const bad = [];
      for (const rel of [...AGENT_DOCS, 'packages/npm/README.md', 'packages/composer/README.md', 'packages/composer/src/NeatOs.php']) {
        const text = read(rel);
        if (text.includes('@shedcollective:registry=https://npm.pkg.github.com') || text.includes('//npm.pkg.github.com/:_authToken=')) {
          bad.push(rel);
        }
      }
      return bad.length ? `registry/_authToken install lines in: ${bad.join(', ')}` : '';
    },
  },
  {
    id: 'init-scaffolds-only',
    adr: '0002',
    check() {
      const skill = read('skills/init/SKILL.md');
      const script = read('skills/init/scripts/copy-templates.sh');
      const problems = [];
      if (/light-scan/.test(skill) || /light-scan/.test(script)) problems.push('init references the evidence scan');
      if (/--jira-prefix|--ticket-prefix|(?:NEAT|SHED)_OS_(?:JIRA|TICKET)_PREFIX/.test(skill) || /prefix/i.test(script)) problems.push('init takes a ticket prefix (that is gather)');
      if (!/scaffold/i.test(skill)) problems.push('init does not describe itself as scaffold');
      return problems.join('; ');
    },
  },
  {
    id: 'gather-is-incomplete-without-interview',
    adr: '0002',
    check() {
      const skill = read('skills/gather/SKILL.md');
      const scan = read('skills/gather/scripts/light-scan.js');
      const tpl = read('templates/.agents/project.md');
      const problems = [];
      if (!/not complete/i.test(skill) || !/Awaiting interview/i.test(skill)) problems.push('gather SKILL.md must say it is not complete until the interview (Awaiting interview)');
      if (!/light-scan\.sh/.test(skill)) problems.push('gather SKILL.md must run light-scan.sh');
      if (!/Awaiting interview/i.test(tpl) || /^- Client:\s*$/m.test(tpl)) problems.push('project.md template must use an Awaiting interview block, not blank Client bullets');
      if (!scan.includes('TODO / ask')) problems.push('light-scan must write a TODO / ask marker for an unknown ticket prefix');
      return problems.join('; ');
    },
  },
  {
    id: 'learn-proposes-only',
    adr: '0002',
    check() {
      const skill = read('skills/learn/SKILL.md');
      const problems = [];
      if (!/propose/i.test(skill)) problems.push('learn must propose');
      if (!/not gather/i.test(skill)) problems.push('learn must say it is not gather');
      if (!/\.agents\/proposals/.test(skill)) problems.push('learn drafts go to .agents/proposals/');
      return problems.join('; ');
    },
  },
  {
    id: 'resolve-order-node-modules-before-sibling',
    adr: '0003',
    check() {
      const problems = [];
      for (const rel of SKILLS) {
        const text = read(rel);
        const n = text.indexOf('node_modules/@shedcollective/neat-os');
        const s = text.indexOf('../neat-os');
        if (n < 0 || s < 0 || n > s) problems.push(`${rel} must mention node_modules before ../neat-os`);
        if (!/resolve-consume/.test(text)) problems.push(`${rel} must point at resolve-consume`);
      }
      const sh = read('skills/init/scripts/resolve-consume.sh');
      const js = read('packages/npm/resolve-consume.js');
      for (const [label, text] of [['resolve-consume.sh', sh], ['resolve-consume.js', js]]) {
        const order = ['NEAT_OS_ROOT', 'node_modules', 'vendor', 'sibling'].map((k) => text.indexOf(k));
        if (order.some((i) => i < 0) || order.some((v, i) => i > 0 && v < order[i - 1])) problems.push(`${label} header must document the locked order`);
      }
      return problems.join('; ');
    },
  },
  {
    id: 'no-web-search-for-neat-os',
    adr: '0003',
    check() {
      const bad = [...SKILLS, 'AGENTS.md', 'templates/AGENTS.md'].filter((rel) => !/search the public web/i.test(read(rel)));
      return bad.length ? `missing web-search prohibition in: ${bad.join(', ')}` : '';
    },
  },
  {
    id: 'no-skill-copy-into-client',
    adr: '0004',
    check() {
      const problems = [];
      if (!/Do \*\*not\*\* copy/.test(read('skills/init/SKILL.md'))) problems.push('init SKILL.md must tell agents not to copy company skills');
      for (const rel of ['skills/init/scripts/copy-templates.sh', 'skills/gather/scripts/light-scan.sh']) {
        if (read(rel).includes('.agents/skills')) problems.push(`${rel} must not reference .agents/skills`);
      }
      const scan = read('skills/gather/scripts/light-scan.js');
      if (/writeFileSync\([^)]*\.agents\/skills/.test(scan) || /copyFileSync\([^)]*skills/.test(scan)) problems.push('light-scan must not write company skills into the client');
      return problems.join('; ');
    },
  },
  {
    id: 'ide-spread-is-not-a-thin-pointer',
    adr: '0004',
    check() {
      const guide = read('templates/.agents/README.md');
      const agents = read('templates/AGENTS.md');
      const problems = [];
      for (const heading of ['Critical Docker', 'Makefile', 'Overview', 'Architecture', 'Directory layout', 'Generated paths']) {
        if (!guide.includes(heading)) problems.push(`Agent Guide template missing ${heading}`);
      }
      if (guide.includes('Project facts only')) problems.push('Agent Guide template must not be a thin skills pointer');
      if (!agents.includes('## Platform leaves') || !agents.includes('.agents/platforms/')) problems.push('AGENTS.md template must carry a Platform leaves section pointing at .agents/platforms/');
      if (!agents.includes('## Stack packs') || !agents.includes('stacks/<name>/')) problems.push('AGENTS.md template must carry a Stack packs section pointing at stacks/<name>/');
      return problems.join('; ');
    },
  },
  {
    id: 'git-flow-and-merge-commits',
    adr: '0005',
    check() {
      const git = read('conventions/git.md');
      const problems = [];
      if (!/git-flow/.test(git) || !/merge commits/i.test(git)) problems.push('conventions/git.md must lock git-flow and merge commits');
      if (!/git-flow/.test(read('templates/AGENTS.md'))) problems.push('AGENTS.md template must ship with git-flow filled');
      return problems.join('; ');
    },
  },
  {
    id: 'written-for-a-reader-with-only-the-repo',
    adr: '0009',
    check() {
      const pages = [
        'README.md',
        'packages/npm/README.md',
        'packages/composer/README.md',
        ...DOC_PAGES,
        ...fs.readdirSync(path.join(root, 'conventions')).filter((n) => n.endsWith('.md')).map((n) => `conventions/${n}`),
        ...fs.readdirSync(path.join(root, 'principles')).filter((n) => n.endsWith('.md')).map((n) => `principles/${n}`),
        ...listMarkdownUnder('stacks'),
        'schema/README.md',
      ];
      // Fenced blocks and inline code are exempt, so a page can name a token to ban it.
      const rules = [
        { name: 'em dash', re: /—/ },
        { name: '≠', re: /≠/ },
        { name: '"in order to"', re: /\bin order to\b/i },
        { name: '"utilise"', re: /\butili[sz]e/i },
        { name: '"leverage"', re: /\bleverag(e|ing)\b/i },
        { name: '"simply"', re: /\bsimply\b/i },
        { name: 'ticket sub-step reference', re: /\b(GH|[A-Z]{2,5})-\d+\b[^.\n]{0,20}\bstep\s+\d/ },
      ];
      const problems = [];
      for (const rel of pages) {
        const lines = read(rel).split('\n');
        let inCode = false;
        lines.forEach((line, i) => {
          if (/^\s*```/.test(line)) inCode = !inCode;
          if (inCode) return;
          const prose = line.replace(/`[^`]*`/g, '``');
          for (const rule of rules) {
            if (rule.re.test(prose)) problems.push(`${rel}:${i + 1} ${rule.name}`);
          }
        });
      }
      return problems.length ? `conventions/writing.md: ${problems.join('; ')}` : '';
    },
  },
];

if (policies.length > 10) {
  console.error(`check-policy: ${policies.length} policies; keep this list ≤ 10 or convert entries to structural checks`);
  process.exit(1);
}

const adrIndex = read('docs/decisions/README.md');
let failed = false;
for (const policy of policies) {
  if (!adrIndex.includes(`[${policy.adr}]`)) {
    console.error(`check-policy: ${policy.id} cites ADR-${policy.adr}, which is not in docs/decisions/README.md`);
    failed = true;
    continue;
  }
  const problem = policy.check();
  if (problem) {
    console.error(`check-policy: ${policy.id} (ADR-${policy.adr}): ${problem}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log(`check-policy OK (${policies.length} policies)`);
