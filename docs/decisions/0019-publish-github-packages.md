# 0019 — Publish neat-os to GitHub Packages on a release

**Status:** Accepted
**Date:** 2026-10-19

## Context

[0017](0017-consume-via-github-packages.md) decided that a product repository installs `@shedcollective/neat-os` from GitHub Packages, and it left `.github/workflows/publish-npm.yml` paused. The licence is MIT. No package has been published. The install that works is the git pin in [consume.md](../consume.md). The token a Cloud Agent receives can read this repository and gets a 403 from the npm registry, so an agent install cannot move to the registry.

The paused sentences in 0017 are the part this record replaces. The rest of 0017 still holds. Product repositories consume the package from GitHub Packages. Cloud Agents and a checkout of this repository keep the resolve order in [0003](0003-resolve-order.md). They do not get a registry token. Composer stays on a VCS repository entry. The packed tarball includes `stacks/` and `skills/`.

## Decision

Publishing is on. `.github/workflows/publish-npm.yml` publishes the root package to `https://npm.pkg.github.com` when a maintainer publishes a GitHub Release. The workflow checks out that release tag, checks the tarball with `npm pack --dry-run`, and runs `npm publish`. It authenticates with `GITHUB_TOKEN` and the `packages: write` permission. It does not publish to the public npm registry.

The root `package.json` and `packages/npm/package.json` set `publishConfig.registry` to `https://npm.pkg.github.com`. The structure check allows that registry and that publish step, and it refuses any other registry.

[consume.md](../consume.md) documents the registry install for a product repository: an `.npmrc` scope line, and a token with `read:packages` on the auth line, locally and in CI. Agents and Cloud Agents keep the git pin. They do not get a registry token.

[0017](0017-consume-via-github-packages.md) is partially superseded. Only the pause is replaced. A maintainer merges, and a maintainer publishes the Release ([keep-human-gates](../../principles/keep-human-gates.md)). This record does not publish a package.

## Consequences

A product repository can install a published version from GitHub Packages. Until the first publish, the git pin remains the install that works. An agent install does not change. `release-smoke.yml` still installs the tag from git and does not publish. The workflow runs from the default branch and packs the release tag, so the tag's `package.json` version must be that tag without the leading `v`.

`v0.4.0` is already a published Release. Publishing that same Release again does not run this workflow. The first run is the next Release. After that publish, a maintainer confirms the package visibility and which repositories may install it. `GITHUB_TOKEN` in this repository is enough to create the package. A consuming repository still needs its own `read:packages` token, because the npm registry on GitHub requires authentication.
