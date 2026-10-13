#!/usr/bin/env node
'use strict';

/**
 * Behaviour smoke: runs init / gather / resolve-consume against throwaway git
 * repos in a temp dir and asserts the observable result (files written, files
 * left alone, consume mode reported). Lifted from the original
 * validate-skeleton.js; assertions here are about behaviour, not wording.
 */

const { execFileSync, spawn } = require('child_process');
// spawn is used by the cloud-agent-environment health fixture below.
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');

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

function gitInit(dir) {
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('git', ['init', '-q'], { cwd: dir });
}

function writeFile(dir, rel, contents) {
  const full = path.join(dir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
}

function runInit(dir, extraEnv = {}, extraArgs = []) {
  return execFileSync('bash', [path.join(root, 'skills/init/scripts/copy-templates.sh'), ...extraArgs, dir], {
    encoding: 'utf8',
    env: { ...withCleanEnv(), ...extraEnv },
  });
}

function runGather(dir, extraEnv = {}, extraArgs = []) {
  return execFileSync('bash', [path.join(root, 'skills/gather/scripts/light-scan.sh'), ...extraArgs, dir], {
    encoding: 'utf8',
    env: { ...withCleanEnv(), ...extraEnv },
  });
}

const lightScan = require(path.join(root, 'skills/gather/scripts/light-scan.js'));

function assertNoSkillCopy(dir, label) {
  if (fs.existsSync(path.join(dir, '.agents/skills'))) {
    throw new Error(`${label}: init must not create .agents/skills`);
  }
  if (fs.existsSync(path.join(dir, 'stacks'))) {
    throw new Error(`${label}: init/gather must not copy stacks/ into the product repo`);
  }
}

function clientProductSection(text) {
  const match = text.match(/## Client & product\n[\s\S]*?(?=\n## |$)/);
  return match ? match[0] : '';
}

function assertScanOnlyInterview(label, projectMd, agentsMd, guideMd) {
  if (!/Awaiting interview/i.test(projectMd)) {
    throw new Error(`${label} scan-only project.md must mark Client/Product as Awaiting interview:\n${projectMd}`);
  }
  if (!/not complete/i.test(projectMd)) {
    throw new Error(`${label} scan-only project.md must say gather is not complete:\n${projectMd}`);
  }
  if (/^- Client:\s*$/m.test(projectMd) || /^- Product(?: \(one paragraph\))?:\s*$/m.test(projectMd)) {
    throw new Error(`${label} must not leave blank Client/Product bullets:\n${projectMd}`);
  }
  const clientSection = clientProductSection(projectMd);
  if (!clientSection) {
    throw new Error(`${label} project.md missing Client & product section:\n${projectMd}`);
  }
  if (/docker compose|Makefile \(|`make /i.test(clientSection)) {
    throw new Error(`${label} must not stuff Docker/Make into Client & product:\n${clientSection}`);
  }
  if (/\{\{PROJECT_NAME\}\}/.test(agentsMd) || (guideMd && /\{\{PROJECT_NAME\}\}/.test(guideMd))) {
    throw new Error(`${label} must not leave {{PROJECT_NAME}} leftovers`);
  }
  if (/\{\{TICKET\}\}/.test(agentsMd)) {
    throw new Error(`${label} must not leave {{TICKET}} leftovers:\n${agentsMd}`);
  }
  if (agentsMd && !/Awaiting interview/i.test(agentsMd)) {
    throw new Error(`${label} AGENTS.md Project section must be Awaiting interview after scan-only:\n${agentsMd}`);
  }
}

const initTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'neat-os-init-'));
try {
  gitInit(initTmp);
  const copyOut = execFileSync('bash', [path.join(root, 'skills/init/scripts/copy-templates.sh'), initTmp], {
    encoding: 'utf8',
    env: withCleanEnv(),
  });
  for (const rel of [
    'AGENTS.md',
    '.agents/project.md',
    '.agents/features/TEMPLATE.md',
    '.agents/README.md',
    '.agents/dependencies/pins.md',
    '.agents/platforms/README.md',
    '.agents/platforms/TEMPLATE.md',
  ]) {
    if (!fs.existsSync(path.join(initTmp, rel))) {
      throw new Error(`init scaffold missing ${rel}`);
    }
  }
  if (fs.existsSync(path.join(initTmp, '.agents/skills'))) {
    throw new Error('init must not create .agents/skills (do not copy company skills)');
  }
  if (fs.existsSync(path.join(initTmp, '.agents/platforms/frontend.md'))) {
    throw new Error('init must not invent frontend.md platform leaves (that is gather)');
  }
  if (copyOut.includes('.agents/skills')) {
    throw new Error('init output must not mention writing .agents/skills');
  }
  const emptyGuide = fs.readFileSync(path.join(initTmp, '.agents/README.md'), 'utf8');
  if (emptyGuide.includes('Project facts only') || !emptyGuide.includes('Agent Guide')) {
    throw new Error(`empty-repo init must copy a gist-shaped Agent Guide template, not a thin pointer:\n${emptyGuide}`);
  }
  if (!emptyGuide.includes('Critical Docker') || !emptyGuide.includes('{{PROJECT_NAME}}')) {
    throw new Error(`empty-repo init must leave gist headings and unfilled placeholders:\n${emptyGuide}`);
  }
  const emptyAgents = fs.readFileSync(path.join(initTmp, 'AGENTS.md'), 'utf8');
  if (!emptyAgents.includes('## Platform leaves') || !emptyAgents.includes('None yet')) {
    throw new Error(`empty-repo init AGENTS.md must scaffold Platform leaves as None yet:\n${emptyAgents}`);
  }
  if (!emptyAgents.includes('## Stack packs') || !emptyAgents.includes('stacks/<name>/')) {
    throw new Error(`empty-repo init AGENTS.md must scaffold Stack packs as None yet:\n${emptyAgents}`);
  }
  if (fs.existsSync(path.join(initTmp, 'stacks'))) {
    throw new Error('init must not copy stacks/ (that is resolved from neat-os)');
  }
  const emptyProject = fs.readFileSync(path.join(initTmp, '.agents/project.md'), 'utf8');
  if (!emptyProject.includes('Containers / Compose: {{to confirm}}')) {
    throw new Error(`empty-repo init must not fill Docker/Make prose:\n${emptyProject}`);
  }
  if (copyOut.includes('light-scan') || copyOut.includes('evidence passport')) {
    throw new Error(`init output must not run the evidence scan:\n${copyOut}`);
  }
} finally {
  fs.rmSync(initTmp, { recursive: true, force: true });
}

const laravelClient = fs.mkdtempSync(path.join(os.tmpdir(), 'neat-os-laravel-'));
try {
  gitInit(laravelClient);
  writeFile(
    laravelClient,
    'composer.json',
    `${JSON.stringify(
      {
        name: 'acme/site',
        description: 'Acme marketing site',
        require: {
          php: '^8.3',
          'laravel/framework': '^11.0',
          'nails/common': '^1.0',
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFile(
    laravelClient,
    'package.json',
    `${JSON.stringify(
      {
        name: '@acme/site',
        private: true,
        dependencies: { react: '^18.2.0' },
      },
      null,
      2,
    )}\n`,
  );
  writeFile(laravelClient, 'artisan', "#!/usr/bin/env php\n<?php\n");
  writeFile(laravelClient, 'app/.gitkeep', '');
  writeFile(laravelClient, 'src/.gitkeep', '');
  writeFile(laravelClient, '.github/workflows/ci.yml', "name: ci\non: [push]\njobs:\n  t:\n    runs-on: ubuntu-latest\n    steps:\n      - run: true\n");
  execFileSync('git', ['checkout', '-q', '-b', 'develop'], { cwd: laravelClient });

  const laravelOut = runInit(laravelClient);
  assertNoSkillCopy(laravelClient, 'laravel client');
  const laravelGuideAfterInit = fs.readFileSync(path.join(laravelClient, '.agents/README.md'), 'utf8');
  const laravelProjectAfterInit = fs.readFileSync(path.join(laravelClient, '.agents/project.md'), 'utf8');
  const laravelAgentsAfterInit = fs.readFileSync(path.join(laravelClient, 'AGENTS.md'), 'utf8');
  if (laravelGuideAfterInit.includes('Project facts only')) {
    throw new Error(`laravel init must copy a gist-shaped Agent Guide, not a thin pointer:\n${laravelGuideAfterInit}`);
  }
  if (!laravelGuideAfterInit.includes('Critical Docker') || !laravelGuideAfterInit.includes('{{PROJECT_NAME}}')) {
    throw new Error(`laravel init must leave Agent Guide placeholders unfilled:\n${laravelGuideAfterInit}`);
  }
  if (laravelProjectAfterInit.includes('Laravel') || laravelAgentsAfterInit.includes('Laravel')) {
    throw new Error('laravel init must not fill stack evidence (that is gather)');
  }
  if (laravelOut.includes('.agents/skills')) {
    throw new Error('laravel init output must not mention writing .agents/skills');
  }

  runGather(laravelClient);
  assertNoSkillCopy(laravelClient, 'laravel client after gather');
  const projectMd = fs.readFileSync(path.join(laravelClient, '.agents/project.md'), 'utf8');
  const agentsMd = fs.readFileSync(path.join(laravelClient, 'AGENTS.md'), 'utf8');
  for (const needle of ['Laravel', 'Nails', 'PHP', 'React', 'Composer']) {
    if (!projectMd.includes(needle)) {
      throw new Error(`laravel client project.md must include ${needle} from gather:\n${projectMd}`);
    }
    if (!agentsMd.includes(needle)) {
      throw new Error(`laravel client AGENTS.md must include ${needle} from gather:\n${agentsMd}`);
    }
  }
  if (!projectMd.includes('TODO / ask: ticket prefix')) {
    throw new Error(`non-interactive gather must leave a ticket-prefix TODO / ask marker:\n${projectMd}`);
  }
  if (!projectMd.includes('--ticket-prefix') || !projectMd.includes('GH for GitHub Issues')) {
    throw new Error(`ticket TODO marker must name both systems and the --ticket-prefix flag:\n${projectMd}`);
  }
  if (!agentsMd.includes('app/') || !agentsMd.includes('.github')) {
    throw new Error(`AGENTS.md repo structure must list notable dirs:\n${agentsMd}`);
  }
  // Laravel + React is a multi-surface tree → platform leaves
  if (!agentsMd.includes('## Platform leaves')) {
    throw new Error(`laravel AGENTS.md must keep Platform leaves section:\n${agentsMd}`);
  }
  if (!agentsMd.includes('.agents/platforms/frontend.md') || !agentsMd.includes('.agents/platforms/backend.md')) {
    throw new Error(`laravel AGENTS.md must link frontend and backend leaves:\n${agentsMd}`);
  }
  if (agentsMd.includes('None yet')) {
    throw new Error(`laravel multi-surface AGENTS.md must not leave Platform leaves as None yet:\n${agentsMd}`);
  }
  if (!agentsMd.includes('## Stack packs') || !agentsMd.includes('stacks/nails/') || !agentsMd.includes('admin-uses-api.md') || !agentsMd.includes('factory-not-new.md') || !agentsMd.includes('fix-at-source.md') || !agentsMd.includes('views-use-curly-braces.md')) {
    throw new Error(`laravel+Nails AGENTS.md must point at stacks/nails/ from neat-os:\n${agentsMd}`);
  }
  if (agentsMd.includes('stacks/laravel/')) {
    throw new Error(`laravel AGENTS.md must not invent a Laravel stack pack:\n${agentsMd}`);
  }
  const laravelFrontend = path.join(laravelClient, '.agents/platforms/frontend.md');
  const laravelBackend = path.join(laravelClient, '.agents/platforms/backend.md');
  if (!fs.existsSync(laravelFrontend) || !fs.existsSync(laravelBackend)) {
    throw new Error('laravel gather must write frontend.md and backend.md platform leaves');
  }
  const laravelFeBody = fs.readFileSync(laravelFrontend, 'utf8');
  const laravelBeBody = fs.readFileSync(laravelBackend, 'utf8');
  if (!laravelFeBody.includes('React') || !laravelFeBody.includes('../../AGENTS.md')) {
    throw new Error(`laravel frontend leaf must cover React and link parent AGENTS.md:\n${laravelFeBody}`);
  }
  if (!laravelBeBody.includes('Laravel') || !laravelBeBody.includes('../../AGENTS.md')) {
    throw new Error(`laravel backend leaf must cover Laravel and link parent AGENTS.md:\n${laravelBeBody}`);
  }
  const laravelGuide = fs.readFileSync(path.join(laravelClient, '.agents/README.md'), 'utf8');
  if (!laravelGuide.includes('platforms/') || !laravelGuide.includes('frontend.md')) {
    throw new Error(`laravel Agent Guide must reference platform leaves:\n${laravelGuide}`);
  }
  assertScanOnlyInterview('laravel client', projectMd, agentsMd, laravelGuide);
  const laravelInterviewed = projectMd
    .replace(/- Client: awaiting interview/, '- Client: Acme Corp')
    .replace(/- Product \(one paragraph\): awaiting interview/, '- Product (one paragraph): Marketing site for Acme.');
  if (!laravelInterviewed.includes('Acme Corp')) {
    throw new Error(`test setup failed to patch Client bullet:\n${projectMd}`);
  }
  const laravelFacts = lightScan.buildFacts(
    laravelClient,
    lightScan.collectEvidence(laravelClient, path.join(root, 'skills/gather/scripts')),
    { jiraPrefix: '' },
  );
  const laravelKept = lightScan.fillProjectMd(laravelInterviewed, laravelFacts, false);
  if (!laravelKept.includes('Acme Corp') || !laravelKept.includes('Marketing site for Acme.')) {
    throw new Error(`re-scan must not wipe interviewed Client/Product:\n${laravelKept}`);
  }
  if (laravelGuide.includes('Project facts only')) {
    throw new Error(`laravel Agent Guide must not be a thin pointer:\n${laravelGuide}`);
  }
  if (!laravelGuide.includes('Agent Guide') || !laravelGuide.includes('Laravel') || !laravelGuide.includes('Directory layout')) {
    throw new Error(`laravel Agent Guide must be gist-shaped and evidence-filled by gather:\n${laravelGuide}`);
  }
} finally {
  fs.rmSync(laravelClient, { recursive: true, force: true });
}

const wpClient = fs.mkdtempSync(path.join(os.tmpdir(), 'neat-os-wp-'));
try {
  gitInit(wpClient);
  writeFile(
    wpClient,
    'composer.json',
    `${JSON.stringify(
      {
        name: 'acme/wp',
        require: { 'johnpbloch/wordpress': '^6.6' },
      },
      null,
      2,
    )}\n`,
  );
  writeFile(wpClient, 'wp-config.php', "<?php\n");
  writeFile(wpClient, 'wp-content/themes/.gitkeep', '');
  const wpOut = runInit(wpClient);
  assertNoSkillCopy(wpClient, 'wordpress client');
  const wpProjectAfterInit = fs.readFileSync(path.join(wpClient, '.agents/project.md'), 'utf8');
  if (wpProjectAfterInit.includes('WordPress') || wpProjectAfterInit.includes('ACME')) {
    throw new Error(`wordpress init must not fill stack or Jira prefix:\n${wpProjectAfterInit}`);
  }
  if (wpOut.includes('.agents/skills')) {
    throw new Error('wordpress init output must not mention writing .agents/skills');
  }

  runGather(wpClient, { NEAT_OS_JIRA_PREFIX: 'ACME' });
  assertNoSkillCopy(wpClient, 'wordpress client after gather');
  const wpProject = fs.readFileSync(path.join(wpClient, '.agents/project.md'), 'utf8');
  const wpAgents = fs.readFileSync(path.join(wpClient, 'AGENTS.md'), 'utf8');
  if (!wpProject.includes('WordPress') || !wpAgents.includes('WordPress')) {
    throw new Error(`wordpress client must record WordPress from gather:\n${wpProject}\n${wpAgents}`);
  }
  if (!wpProject.includes('ACME')) {
    throw new Error(`NEAT_OS_JIRA_PREFIX must fill the ticket prefix during gather:\n${wpProject}`);
  }
  // Single-surface WordPress → no invented frontend/backend leaves
  if (!wpAgents.includes('## Platform leaves') || !wpAgents.includes('None yet')) {
    throw new Error(`wordpress single-surface AGENTS.md must keep Platform leaves as None yet:\n${wpAgents}`);
  }
  if (!wpAgents.includes('## Stack packs') || !/## Stack packs\n\nNone yet/.test(wpAgents)) {
    throw new Error(`wordpress AGENTS.md must keep Stack packs as None yet (no WordPress pack):\n${wpAgents}`);
  }
  if (wpAgents.includes('stacks/nails/')) {
    throw new Error(`wordpress AGENTS.md must not link the Nails stack pack:\n${wpAgents}`);
  }
  if (fs.existsSync(path.join(wpClient, '.agents/platforms/frontend.md'))) {
    throw new Error('wordpress gather must not invent a frontend leaf');
  }
  if (fs.existsSync(path.join(wpClient, '.agents/platforms/backend.md'))) {
    throw new Error('wordpress gather must not invent a backend leaf for a single-surface tree');
  }
} finally {
  fs.rmSync(wpClient, { recursive: true, force: true });
}

const parsedCompose = lightScan.parseComposeServices(`
services:
  php:
    image: acme-php
    build: .
  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
  nginx:
    image: nginx:1.27
    ports:
      - "8080:80"
`);
if (parsedCompose.map((s) => s.name).join(',') !== 'php,db,nginx') {
  throw new Error(`parseComposeServices must read php, db, nginx; got ${JSON.stringify(parsedCompose)}`);
}
if (!parsedCompose.find((s) => s.name === 'db').ports.includes('3306:3306')) {
  throw new Error(`parseComposeServices must record db ports: ${JSON.stringify(parsedCompose)}`);
}

const parsedMake = lightScan.parseMakefileTargets(
  [
    '.PHONY: up down shell composer',
    '',
    '# Start the stack',
    'up:',
    '\tdocker compose up -d',
    '',
    'down:',
    '\tdocker compose down',
    '',
    'shell:',
    '\tdocker compose exec php bash',
    '',
    'composer:',
    '\tdocker compose exec php composer $(ARGS)',
    '',
  ].join('\n'),
);
if (!parsedMake.some((t) => t.name === 'up' && /docker compose up/.test(t.recipes[0] || ''))) {
  throw new Error(`parseMakefileTargets must capture make up recipe: ${JSON.stringify(parsedMake)}`);
}
if (parsedMake.some((t) => t.name === 'PHONY')) {
  throw new Error('parseMakefileTargets must skip .PHONY');
}

const parsedWf = lightScan.parseGithubWorkflow(
  'ci.yml',
  'name: CI\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n  lint:\n    runs-on: ubuntu-latest\n',
);
if (parsedWf.name !== 'CI' || !parsedWf.jobs.includes('test') || !parsedWf.imply.includes('tests') || !parsedWf.imply.includes('lint')) {
  throw new Error(`parseGithubWorkflow must infer CI test/lint: ${JSON.stringify(parsedWf)}`);
}

const ezClient = fs.mkdtempSync(path.join(os.tmpdir(), 'neat-os-acme-'));
const ezOps = `# ACME local ops

This project is **Docker-only**. Do not run Composer on the host.

## Commands

- \`make up\` — start php, db, nginx
- \`make shell\` — php container
- \`make composer\` — composer in php

## Architecture

App code lives in \`www/\`.
`;
if (!lightScan.isFillableAgentsReadme('# .agents\n\n**Project facts only.** This directory holds client / stack / env knowledge for this repo.\n\nDo **not** copy neat-os `skills/` into this tree.\n')) {
  throw new Error('isFillableAgentsReadme must treat the old thin pointer as fillable');
}
if (!lightScan.isFillableAgentsReadme('# {{PROJECT_NAME}} — Agent Guide\n\n## Critical Docker / container rules\n\n{{Compose}}\n')) {
  throw new Error('isFillableAgentsReadme must treat the gist template as fillable');
}
if (lightScan.isFillableAgentsReadme(ezOps)) {
  throw new Error('isFillableAgentsReadme must not treat a hand-written Agent Guide as a template');
}
try {
  gitInit(ezClient);
  writeFile(
    ezClient,
    'www/composer.json',
    `${JSON.stringify(
      {
        name: 'acme/site',
        description: 'ACME marketing WordPress site',
        require: {
          php: '^8.2',
          'johnpbloch/wordpress': '^6.6',
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFile(ezClient, 'www/wp-content/themes/.gitkeep', '');
  writeFile(
    ezClient,
    'docker-compose.yml',
    `services:
  php:
    build: .
    image: acme-php
  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
  nginx:
    image: nginx:1.27
    ports:
      - "8080:80"
`,
  );
  writeFile(
    ezClient,
    'Dockerfile',
    'FROM php:8.2-fpm\nWORKDIR /var/www\nEXPOSE 9000\n',
  );
  writeFile(
    ezClient,
    'Makefile',
    [
      '.PHONY: up down shell composer logs',
      '',
      '# Start the stack',
      'up:',
      '\tdocker compose up -d',
      '',
      'down:',
      '\tdocker compose down',
      '',
      'shell:',
      '\tdocker compose exec php bash',
      '',
      'composer:',
      '\tdocker compose exec php composer $(ARGS)',
      '',
      'logs:',
      '\tdocker compose logs -f',
      '',
    ].join('\n'),
  );
  writeFile(ezClient, '.agents/features/ACME-100-overview.md', '# ACME-100 homepage refresh\n\nPlan for the homepage.\n');
  writeFile(
    ezClient,
    '.github/workflows/ci.yml',
    'name: CI\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - run: true\n  lint:\n    runs-on: ubuntu-latest\n    steps:\n      - run: true\n',
  );
  execFileSync('git', ['checkout', '-q', '-b', 'develop'], { cwd: ezClient });

  const ezInitOut = runInit(ezClient);
  assertNoSkillCopy(ezClient, 'acme-like client');
  if (fs.existsSync(path.join(ezClient, '.agents/skills'))) {
    throw new Error('acme-like client must not receive copied skills');
  }
  const ezGuideAfterInit = fs.readFileSync(path.join(ezClient, '.agents/README.md'), 'utf8');
  const ezProjectAfterInit = fs.readFileSync(path.join(ezClient, '.agents/project.md'), 'utf8');
  if (!ezGuideAfterInit.includes('Critical Docker') || !ezGuideAfterInit.includes('{{PROJECT_NAME}}')) {
    throw new Error(`acme-like init must leave gist Agent Guide placeholders:\n${ezGuideAfterInit}`);
  }
  if (!ezProjectAfterInit.includes('Containers / Compose: {{to confirm}}') || !ezProjectAfterInit.includes('Makefile / task runner: {{to confirm}}')) {
    throw new Error(`acme-like init must not fill Docker/Make prose:\n${ezProjectAfterInit}`);
  }
  if (ezGuideAfterInit.includes('make up') || ezProjectAfterInit.includes('make up')) {
    throw new Error('acme-like init must not write Make recipes (that is gather)');
  }
  if (ezInitOut.includes('.agents/skills')) {
    throw new Error('acme-like init output must not mention writing .agents/skills');
  }

  const ezOut = runGather(ezClient, { NEAT_OS_JIRA_PREFIX: 'ACME' });
  assertNoSkillCopy(ezClient, 'acme-like client after gather');
  const ezGuide = fs.readFileSync(path.join(ezClient, '.agents/README.md'), 'utf8');
  if (ezGuide.includes('Project facts only') || ezGuide.trim().split('\n').length < 20) {
    throw new Error(`acme-like Agent Guide must not be a thin pointer:\n${ezGuide}`);
  }
  for (const needle of [
    'Agent Guide',
    'Critical Docker',
    'Makefile',
    'Architecture',
    'Directory layout',
    'www/',
    'php',
    'nginx',
    'make up',
    'docker compose',
    'WordPress',
  ]) {
    if (!ezGuide.includes(needle)) {
      throw new Error(`acme-like .agents/README.md must include ${JSON.stringify(needle)} after gather:\n${ezGuide}`);
    }
  }
  if (!/container/i.test(ezGuide) && !/Docker/i.test(ezGuide)) {
    throw new Error(`acme-like Agent Guide must mention container/Docker evidence after gather:\n${ezGuide}`);
  }

  const ezProject = fs.readFileSync(path.join(ezClient, '.agents/project.md'), 'utf8');
  const ezAgents = fs.readFileSync(path.join(ezClient, 'AGENTS.md'), 'utf8');
  for (const [label, body] of [
    ['.agents/project.md', ezProject],
    ['AGENTS.md', ezAgents],
    ['.agents/README.md', ezGuide],
  ]) {
    for (const needle of [
      'www/',
      'WordPress',
      'PHP',
      'docker-compose.yml',
      'php',
      'nginx',
      'make up',
      'docker compose up',
      'ACME-100',
      'Gather next',
    ]) {
      if (!body.includes(needle)) {
        throw new Error(`acme-like ${label} passport must include ${JSON.stringify(needle)}:\n${body}`);
      }
    }
    if (label === 'AGENTS.md' && !body.includes('.agents/README.md')) {
      throw new Error(`acme-like AGENTS.md must point at the Agent Guide:\n${body}`);
    }
    if (/\{\{to confirm\}\}/.test(body) && /Containers \/ Compose: \{\{to confirm\}\}/.test(body)) {
      throw new Error(`acme-like ${label} must not leave Compose as an empty placeholder:\n${body}`);
    }
    if (/Containers \/ Compose: \{\{to confirm\}\}/.test(body) || /Makefile \/ task runner: \{\{to confirm\}\}/.test(body)) {
      throw new Error(`acme-like ${label} must fill Docker/Make evidence, not placeholders:\n${body}`);
    }
    if (/Exact commands per sub-project/.test(body)) {
      throw new Error(`acme-like ${label} must replace empty local-setup placeholder:\n${body}`);
    }
    if (/DeployHQ/.test(body) && /DeployHQ config present/.test(body)) {
      throw new Error(`acme-like ${label} must not invent DeployHQ config:\n${body}`);
    }
  }
  if (!ezProject.includes('`www/`') && !ezProject.includes('www/')) {
    throw new Error(`acme-like project.md must record nested app root:\n${ezProject}`);
  }
  if (!ezProject.includes('none found') && !ezProject.includes('make up')) {
    throw new Error(`acme-like project.md must mention Make targets:\n${ezProject}`);
  }
  if (ezProject.includes('App root(s): {{to confirm}}') || ezProject.includes('How to start (from evidence): {{to confirm}}')) {
    throw new Error(`acme-like project.md left layout placeholders empty:\n${ezProject}`);
  }
  assertScanOnlyInterview('acme-like client', ezProject, ezAgents, ezGuide);
  if (ezGuide.includes('Start the stack')) {
    throw new Error(`acme-like Agent Guide must not repeat Makefile preceding comments:\n${ezGuide}`);
  }
  if (ezOut.includes('.agents/skills')) {
    throw new Error('acme-like gather output must not mention writing .agents/skills');
  }
} finally {
  fs.rmSync(ezClient, { recursive: true, force: true });
}

const customGuideClient = fs.mkdtempSync(path.join(os.tmpdir(), 'neat-os-custom-guide-'));
try {
  gitInit(customGuideClient);
  writeFile(customGuideClient, 'package.json', `${JSON.stringify({ name: 'acme/custom' }, null, 2)}\n`);
  writeFile(customGuideClient, '.agents/README.md', ezOps);
  runInit(customGuideClient);
  assertNoSkillCopy(customGuideClient, 'custom-guide client');
  if (fs.readFileSync(path.join(customGuideClient, '.agents/README.md'), 'utf8') !== ezOps) {
    throw new Error('init must not overwrite a hand-written .agents/README.md Agent Guide');
  }
  runGather(customGuideClient, { NEAT_OS_JIRA_PREFIX: 'ACME' });
  if (fs.readFileSync(path.join(customGuideClient, '.agents/README.md'), 'utf8') !== ezOps) {
    throw new Error('gather must not overwrite a hand-written .agents/README.md Agent Guide');
  }
} finally {
  fs.rmSync(customGuideClient, { recursive: true, force: true });
}

// Ticket prefix: --ticket-prefix is primary, --jira-prefix an alias; the new env
// wins over the old; OS repos get GH from conventions/tickets.md without asking.
const ticketParent = fs.mkdtempSync(path.join(os.tmpdir(), 'neat-os-ticket-'));
try {
  function nodeClientAt(name, pkgName) {
    const dir = path.join(ticketParent, name);
    gitInit(dir);
    writeFile(dir, 'package.json', `${JSON.stringify({ name: pkgName, private: true }, null, 2)}\n`);
    runInit(dir);
    return dir;
  }
  function ticketLine(dir) {
    const text = fs.readFileSync(path.join(dir, '.agents/project.md'), 'utf8');
    return (text.match(/^- Ticket prefix:\s*(.*)$/m) || [])[1] || '';
  }

  const flagClient = nodeClientAt('flag', '@acme/flag');
  runGather(flagClient, {}, ['--ticket-prefix=GH']);
  if (ticketLine(flagClient) !== 'GH') {
    throw new Error(`--ticket-prefix=GH must set the prefix; got ${JSON.stringify(ticketLine(flagClient))}`);
  }
  const flagAgents = fs.readFileSync(path.join(flagClient, 'AGENTS.md'), 'utf8');
  if (!flagAgents.includes('.agents/features/GH-overview.md')) {
    throw new Error(`{{TICKET}} must resolve to the GH key in AGENTS.md:\n${flagAgents}`);
  }

  const aliasClient = nodeClientAt('alias', '@acme/alias');
  runGather(aliasClient, {}, ['--jira-prefix', 'ACME']);
  if (ticketLine(aliasClient) !== 'ACME') {
    throw new Error(`--jira-prefix alias must still work; got ${JSON.stringify(ticketLine(aliasClient))}`);
  }

  const envClient = nodeClientAt('env', '@acme/env');
  runGather(envClient, { NEAT_OS_TICKET_PREFIX: 'NEW', NEAT_OS_JIRA_PREFIX: 'OLD' });
  if (ticketLine(envClient) !== 'NEW') {
    throw new Error(`NEAT_OS_TICKET_PREFIX must win over NEAT_OS_JIRA_PREFIX; got ${JSON.stringify(ticketLine(envClient))}`);
  }

  const oldEnvClient = nodeClientAt('old-env', '@acme/old-env');
  runGather(oldEnvClient, { NEAT_OS_JIRA_PREFIX: 'OLD' });
  if (ticketLine(oldEnvClient) !== 'OLD') {
    throw new Error(`NEAT_OS_JIRA_PREFIX alone must still be honoured; got ${JSON.stringify(ticketLine(oldEnvClient))}`);
  }

  const deprecatedEnvClient = nodeClientAt('deprecated-env', '@acme/deprecated-env');
  runGather(deprecatedEnvClient, { SHED_OS_TICKET_PREFIX: 'OLD', SHED_OS_JIRA_PREFIX: 'OLDER' });
  if (ticketLine(deprecatedEnvClient) !== 'OLD') {
    throw new Error(`SHED_OS_TICKET_PREFIX must still fill the prefix; got ${JSON.stringify(ticketLine(deprecatedEnvClient))}`);
  }
  const neatWinsClient = nodeClientAt('neat-wins', '@acme/neat-wins');
  runGather(neatWinsClient, { NEAT_OS_TICKET_PREFIX: 'NEW', SHED_OS_TICKET_PREFIX: 'OLD' });
  if (ticketLine(neatWinsClient) !== 'NEW') {
    throw new Error(`NEAT_OS_TICKET_PREFIX must win over SHED_OS_TICKET_PREFIX; got ${JSON.stringify(ticketLine(neatWinsClient))}`);
  }

  const leafClient = nodeClientAt('neat-os-platform-laravel', '@shedcollective/neat-os-platform-laravel');
  runGather(leafClient);
  const leafTicket = ticketLine(leafClient);
  if (!/^GH\b/.test(leafTicket) || !/GitHub Issues/.test(leafTicket)) {
    throw new Error(`an OS leaf repo must get GH from conventions/tickets.md without asking; got ${JSON.stringify(leafTicket)}`);
  }
  const leafProject = fs.readFileSync(path.join(leafClient, '.agents/project.md'), 'utf8');
  if (leafProject.includes('TODO / ask: ticket prefix') || /^- Ticket prefix.*\(ask/m.test(leafProject)) {
    throw new Error(`OS repo gather must not ask for a ticket prefix:\n${leafProject}`);
  }
  if (!fs.readFileSync(path.join(leafClient, 'AGENTS.md'), 'utf8').includes('.agents/features/GH-overview.md')) {
    throw new Error('OS repo gather must resolve {{TICKET}} to GH');
  }

  const plainClient = nodeClientAt('plain', '@acme/plain');
  runGather(plainClient);
  if (!/^TODO \/ ask: ticket prefix/.test(ticketLine(plainClient))) {
    throw new Error(`a client repo with no prefix must still get the TODO marker; got ${JSON.stringify(ticketLine(plainClient))}`);
  }
} finally {
  fs.rmSync(ticketParent, { recursive: true, force: true });
}

// A hand-written AGENTS.md (no mustache, no gather sentence) is cited, not
// appended to; project.md still fills.
const handWrittenClient = fs.mkdtempSync(path.join(os.tmpdir(), 'neat-os-handwritten-'));
try {
  gitInit(handWrittenClient);
  writeFile(handWrittenClient, 'package.json', `${JSON.stringify({ name: 'acme/hand', private: true }, null, 2)}\n`);
  const handAgents = '# acme/hand — agent guide\n\nHand-written. Read `docs/` first.\n\n## Rules\n\n- Never rename the `Widget` table.\n';
  writeFile(handWrittenClient, 'AGENTS.md', handAgents);
  runInit(handWrittenClient);
  if (fs.readFileSync(path.join(handWrittenClient, 'AGENTS.md'), 'utf8') !== handAgents) {
    throw new Error('init must not overwrite a hand-written AGENTS.md');
  }
  const handOut = runGather(handWrittenClient, {}, ['--ticket-prefix=ACME']);
  const handAfter = fs.readFileSync(path.join(handWrittenClient, 'AGENTS.md'), 'utf8');
  if (handAfter !== handAgents) {
    throw new Error(`gather must not append scan sections to a hand-written AGENTS.md:\n${handAfter}`);
  }
  if (!/^cited:\s+AGENTS\.md/m.test(handOut)) {
    throw new Error(`gather must report a hand-written AGENTS.md as cited:\n${handOut}`);
  }
  const handProject = fs.readFileSync(path.join(handWrittenClient, '.agents/project.md'), 'utf8');
  if (!handProject.includes('ACME') || !handProject.includes('JavaScript')) {
    throw new Error(`gather must still fill project.md next to a hand-written AGENTS.md:\n${handProject}`);
  }
  if (!lightScan.isTemplateAgentsMd(fs.readFileSync(path.join(root, 'templates/AGENTS.md'), 'utf8'))) {
    throw new Error('isTemplateAgentsMd must recognise the shipped template');
  }
  if (lightScan.isTemplateAgentsMd(handAgents)) {
    throw new Error('isTemplateAgentsMd must not treat hand-written prose as a template');
  }
} finally {
  fs.rmSync(handWrittenClient, { recursive: true, force: true });
}

// package.json scripts count as start evidence; a scan-written "no evidence"
// sentence is refilled when evidence appears later.
const scriptsClient = fs.mkdtempSync(path.join(os.tmpdir(), 'neat-os-scripts-'));
try {
  gitInit(scriptsClient);
  writeFile(scriptsClient, 'package.json', `${JSON.stringify({ name: '@acme/tool', private: true }, null, 2)}\n`);
  runInit(scriptsClient);
  runGather(scriptsClient, {}, ['--ticket-prefix=ACME']);
  const bare = fs.readFileSync(path.join(scriptsClient, '.agents/project.md'), 'utf8');
  if (!/^- How to start \(from evidence\): No Makefile or Compose start path found/m.test(bare)) {
    throw new Error(`a bare Node repo must report no start path:\n${bare}`);
  }
  writeFile(
    scriptsClient,
    'package.json',
    `${JSON.stringify({ name: '@acme/tool', private: true, scripts: { test: 'bash scripts/check', lint: 'eslint .', pretest: 'true' } }, null, 2)}\n`,
  );
  runGather(scriptsClient, {}, ['--ticket-prefix=ACME']);
  const withScripts = fs.readFileSync(path.join(scriptsClient, '.agents/project.md'), 'utf8');
  const startLine = (withScripts.match(/^- How to start \(from evidence\):\s*(.*)$/m) || [])[1] || '';
  if (!startLine.includes('`npm test`') || !startLine.includes('bash scripts/check') || !startLine.includes('`npm run lint`')) {
    throw new Error(`re-scan must pick up package.json scripts as start evidence:\n${startLine}`);
  }
  if (startLine.includes('pretest')) {
    throw new Error(`pre/post hooks must not be listed as start commands:\n${startLine}`);
  }
  const guide = fs.readFileSync(path.join(scriptsClient, '.agents/README.md'), 'utf8');
  if (!guide.includes('`npm test`')) {
    throw new Error(`Agent Guide How to start must list package scripts:\n${guide}`);
  }
  // Interview patches Overview; a later re-scan refreshes evidence sections but keeps it.
  const interviewed = guide.replace(/## Overview\n\n[\s\S]*?(?=\n## )/, '## Overview\n\nAcme internal CLI tool, owned by Platform team.\n');
  if (!interviewed.includes('Acme internal CLI tool')) {
    throw new Error('test setup failed to patch Overview');
  }
  fs.writeFileSync(path.join(scriptsClient, '.agents/README.md'), interviewed);
  writeFile(scriptsClient, 'Makefile', 'up:\n\tdocker compose up -d\n');
  runGather(scriptsClient, {}, ['--ticket-prefix=ACME']);
  const refreshed = fs.readFileSync(path.join(scriptsClient, '.agents/README.md'), 'utf8');
  if (!refreshed.includes('Acme internal CLI tool')) {
    throw new Error(`re-scan must keep the interviewed Overview in an evidence-written guide:\n${refreshed}`);
  }
  if (!refreshed.includes('`make up`')) {
    throw new Error(`re-scan must refresh evidence sections of an evidence-written guide:\n${refreshed}`);
  }
  if (!lightScan.isEvidenceAgentsGuide(refreshed) || lightScan.isEvidenceAgentsGuide(ezOps)) {
    throw new Error('isEvidenceAgentsGuide must match gather-written guides only');
  }
  if (/Local host commands \(no Makefile\/Compose start path in the tree\)/.test(withScripts)) {
    throw new Error(`Gather next must not ask for host commands once scripts are evidence:\n${withScripts}`);
  }
} finally {
  fs.rmSync(scriptsClient, { recursive: true, force: true });
}

const consumeParent = fs.mkdtempSync(path.join(os.tmpdir(), 'neat-os-consume-'));
try {
  const resolve = path.join(root, 'skills/init/scripts/resolve-consume.sh');
  const { resolveConsume } = require(path.join(root, 'packages/npm/resolve-consume.js'));

  function consumeMode(out) {
    const match = String(out).match(/^mode:\s+(\S+)/m);
    return match ? match[1] : '';
  }

  function runResolve(target, extraEnv = {}) {
    return execFileSync('bash', [resolve, target], {
      encoding: 'utf8',
      env: { ...withCleanEnv(), ...extraEnv },
    });
  }

  function linkNodePkg(dir, name = 'neat-os') {
    fs.mkdirSync(path.join(dir, 'node_modules/@shedcollective'), { recursive: true });
    fs.symlinkSync(root, path.join(dir, 'node_modules/@shedcollective', name));
  }

  function assertMode(label, out, expected) {
    const mode = consumeMode(out);
    if (mode !== expected) {
      throw new Error(`${label}: expected mode ${expected}, got ${mode}\n${out}`);
    }
  }

  const missingDir = path.join(consumeParent, 'lonely');
  gitInit(missingDir);
  let missingCode = 0;
  let missingOut = '';
  try {
    missingOut = runResolve(missingDir);
  } catch (err) {
    missingCode = err.status || 1;
    missingOut = `${err.stdout || ''}${err.stderr || ''}`;
  }
  if (missingCode !== 1 || consumeMode(missingOut) !== 'missing') {
    throw new Error(`resolve-consume.sh must exit 1 with mode missing on an isolated repo; got ${missingCode}\n${missingOut}`);
  }
  if (!/Do not search the public web/i.test(missingOut)) {
    throw new Error(`missing consume hint must forbid web-search:\n${missingOut}`);
  }

  const siblingClient = path.join(consumeParent, 'client');
  gitInit(siblingClient);
  fs.symlinkSync(root, path.join(consumeParent, 'neat-os'));
  const siblingOut = runResolve(siblingClient);
  assertMode('sibling-only', siblingOut, 'sibling');
  if (!siblingOut.includes(root)) {
    throw new Error(`resolve-consume.sh must detect a ../neat-os sibling:\n${siblingOut}`);
  }
  const siblingHit = resolveConsume(siblingClient, withCleanEnv());
  if (siblingHit.mode !== 'sibling') {
    throw new Error(`resolveConsume() must agree on sibling; got ${siblingHit.mode}`);
  }

  const nodeClient = path.join(consumeParent, 'ide-app');
  gitInit(nodeClient);
  linkNodePkg(nodeClient);
  const nodeOut = runResolve(nodeClient);
  assertMode('node_modules-only', nodeOut, 'node_modules');
  if (resolveConsume(nodeClient, withCleanEnv()).mode !== 'node_modules') {
    throw new Error('resolveConsume() must detect node_modules before sibling');
  }

  linkNodePkg(siblingClient);
  const bothOut = runResolve(siblingClient);
  assertMode('node_modules-beats-sibling', bothOut, 'node_modules');
  if (resolveConsume(siblingClient, withCleanEnv()).mode !== 'node_modules') {
    throw new Error('resolveConsume() must prefer node_modules over sibling');
  }

  const envOut = runResolve(siblingClient, { NEAT_OS_ROOT: root });
  assertMode('env-beats-node_modules', envOut, 'env');
  if (resolveConsume(siblingClient, { ...withCleanEnv(), NEAT_OS_ROOT: root }).mode !== 'env') {
    throw new Error('resolveConsume() must prefer NEAT_OS_ROOT over node_modules');
  }

  let relativeEnvOut = '';
  try {
    relativeEnvOut = execFileSync('bash', [resolve, siblingClient], {
      encoding: 'utf8',
      env: { ...withCleanEnv(), NEAT_OS_ROOT: '../neat-os' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    relativeEnvOut = `${err.stdout || ''}${err.stderr || ''}`;
  }
  assertMode('relative-NEAT_OS_ROOT-skipped', relativeEnvOut, 'node_modules');

  const deprecatedRootOut = runResolve(siblingClient, { SHED_OS_ROOT: root });
  assertMode('deprecated-SHED_OS_ROOT', deprecatedRootOut, 'env');
  if (resolveConsume(siblingClient, { ...withCleanEnv(), SHED_OS_ROOT: root }).mode !== 'env') {
    throw new Error('resolveConsume() must still honour deprecated SHED_OS_ROOT');
  }
  const neatBeatsShed = runResolve(siblingClient, { NEAT_OS_ROOT: root, SHED_OS_ROOT: path.join(consumeParent, 'missing-root') });
  assertMode('NEAT_OS_ROOT-beats-SHED_OS_ROOT', neatBeatsShed, 'env');

  const deprecatedNode = path.join(consumeParent, 'old-node');
  gitInit(deprecatedNode);
  linkNodePkg(deprecatedNode, 'shed-os');
  const deprecatedNodeOut = runResolve(deprecatedNode);
  assertMode('deprecated-node_modules', deprecatedNodeOut, 'node_modules');

  const deprecatedSibling = path.join(consumeParent, 'old-sibling-parent', 'client');
  gitInit(deprecatedSibling);
  fs.symlinkSync(root, path.join(consumeParent, 'old-sibling-parent', 'shed-os'));
  const deprecatedSiblingOut = runResolve(deprecatedSibling);
  assertMode('deprecated-sibling', deprecatedSiblingOut, 'sibling');

  const phpClient = path.join(consumeParent, 'php-app');
  gitInit(phpClient);
  fs.mkdirSync(path.join(phpClient, 'vendor/shedcollective/neat-os'), { recursive: true });
  const phpOut = runResolve(phpClient);
  assertMode('vendor-only', phpOut, 'vendor');

  const deprecatedVendor = path.join(consumeParent, 'old-php');
  gitInit(deprecatedVendor);
  fs.mkdirSync(path.join(deprecatedVendor, 'vendor/shedcollective/shed-os'), { recursive: true });
  const deprecatedVendorOut = runResolve(deprecatedVendor);
  assertMode('deprecated-vendor', deprecatedVendorOut, 'vendor');

  const vendorPlusSibling = path.join(consumeParent, 'php-with-sib');
  gitInit(vendorPlusSibling);
  fs.mkdirSync(path.join(vendorPlusSibling, 'vendor/shedcollective/neat-os'), { recursive: true });
  const vendorSibOut = runResolve(vendorPlusSibling);
  assertMode('vendor-beats-sibling', vendorSibOut, 'vendor');

  const site = path.join(consumeParent, 'mono', 'packages', 'site');
  gitInit(site);
  linkNodePkg(path.join(consumeParent, 'mono'));
  const walkOut = runResolve(site);
  assertMode('walk-up-node_modules', walkOut, 'node_modules');
  if (resolveConsume(site, withCleanEnv()).mode !== 'node_modules') {
    throw new Error('resolveConsume() must walk up to node_modules/@shedcollective/neat-os');
  }

  const checkoutDir = path.join(consumeParent, 'isolated-parent', 'os-checkout');
  gitInit(checkoutDir);
  fs.symlinkSync(path.join(root, 'skills'), path.join(checkoutDir, 'skills'));
  fs.symlinkSync(path.join(root, 'templates'), path.join(checkoutDir, 'templates'));
  writeFile(checkoutDir, 'package.json', `${JSON.stringify({ name: '@shedcollective/neat-os' }, null, 2)}\n`);
  const checkoutOut = runResolve(checkoutDir);
  assertMode('checkout-self', checkoutOut, 'checkout');
} finally {
  fs.rmSync(consumeParent, { recursive: true, force: true });
}

// cloud-agent-environment helpers: offline behaviour. Network probes of
// Docker Hub stay out of this check.
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

console.log('check-smoke OK');
