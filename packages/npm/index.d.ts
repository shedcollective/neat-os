export type NeatOsConsumeMode =
  | 'env'
  | 'node_modules'
  | 'vendor'
  | 'sibling'
  | 'checkout'
  | 'missing';

export interface NeatOsConsumeHit {
  target: string;
  mode: NeatOsConsumeMode;
  root: string;
  skillsDir: string;
  envRoot: string;
  envWarning: string;
  checkout: string;
  nodePkg: string;
  vendor: string;
  sibling: string;
}

export interface NeatOsPaths {
  name: string;
  version: string;
  packageRoot: string;
  repoRoot: string;
  skillsDir: string;
  templatesDir: string;
  principlesDir: string;
  conventionsDir: string;
  resolveConsume(fromDir?: string, env?: NodeJS.ProcessEnv): NeatOsConsumeHit;
  formatConsumeReport(result: NeatOsConsumeHit): string;
}

declare const neatOs: NeatOsPaths;
export = neatOs;
