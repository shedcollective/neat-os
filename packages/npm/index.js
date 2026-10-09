'use strict';

const fs = require('fs');
const path = require('path');

function firstExisting(candidates) {
  for (const dir of candidates) {
    if (dir && fs.existsSync(dir)) {
      return dir;
    }
  }
  return candidates[0];
}

const packageRoot = __dirname;
const repoRoot = path.resolve(__dirname, '../..');

const skillsDir = firstExisting([
  path.join(packageRoot, 'skills'),
  path.join(repoRoot, 'skills'),
]);

const templatesDir = firstExisting([
  path.join(packageRoot, 'templates'),
  path.join(repoRoot, 'templates'),
]);

const principlesDir = firstExisting([
  path.join(packageRoot, 'principles'),
  path.join(repoRoot, 'principles'),
]);

const conventionsDir = firstExisting([
  path.join(packageRoot, 'conventions'),
  path.join(repoRoot, 'conventions'),
]);

const { resolveConsume, formatConsumeReport } = require('./resolve-consume');

module.exports = {
  name: '@shedcollective/neat-os',
  version: '0.4.0',
  packageRoot,
  repoRoot: fs.existsSync(path.join(repoRoot, 'skills')) ? repoRoot : packageRoot,
  skillsDir,
  templatesDir,
  principlesDir,
  conventionsDir,
  resolveConsume,
  formatConsumeReport,
};
