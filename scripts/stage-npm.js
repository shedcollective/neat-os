#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const destRoot = path.join(repoRoot, 'packages', 'npm');
const dirs = ['skills', 'templates', 'principles', 'conventions', 'stacks'];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else if (entry.isSymbolicLink()) {
      fs.symlinkSync(fs.readlinkSync(from), to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

for (const dir of dirs) {
  const src = path.join(repoRoot, dir);
  const dest = path.join(destRoot, dir);
  if (!fs.existsSync(src)) {
    throw new Error(`missing ${src}`);
  }
  fs.rmSync(dest, { recursive: true, force: true });
  copyDir(src, dest);
  process.stdout.write(`staged ${dir} -> packages/npm/${dir}\n`);
}
