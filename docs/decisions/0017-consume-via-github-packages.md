# 0017 — Client repositories consume shed-os from GitHub Packages

**Status:** Accepted
**Date:** 2026-10-08

## Context

[0001](0001-consume-via-git-not-packages.md) made every Node install a git dependency, so a client repository needed a git credential on every install. That is the hoop a normal package install avoids. The Cursor GitHub App token still cannot read the npm registry on GitHub (403), and a Packages token for an agent stays rejected. The root `package.json` `files` list, and the staged list under `packages/npm`, left out `stacks/`, so a published tarball would not have shipped the stack packs. The change is recorded in the archive repository.

## Decision

Client repositories install `@shedcollective/shed-os` from GitHub Packages. That supersedes the git-only rule in 0001 for those repositories. Cloud Agents and a checkout of this repository keep the resolve order in [0003](0003-resolve-order.md). They do not get a registry token, and they do not get a registry auth line in the docs. Composer stays on a VCS repository entry.

The licence is MIT. The `license` field is `MIT`, and `LICENSE` at the repository root holds the text. `publish-npm.yml` stays paused. This record does not turn publishing on.

The root `files` list and the staged `packages/npm` pack both include `stacks/`. The module does not export a `stacksDir`. Playbooks read the pack from the resolved tree.

Until a package is published, the install that works is still the git pin in [consume.md](../consume.md).

## Consequences

A client repository stops carrying a git dependency once a package exists. An agent install does not move to the registry. The structure check still refuses an active `npm publish` and a `publishConfig` registry while the workflow is paused. Publishing is a later human step.

## Note

From version 0.4.0 the package name is `@shedcollective/neat-os` (Composer: `shedcollective/neat-os`). This decision keeps the name that was true on the date above, and it keeps the intent to publish later. User-facing install docs describe only the git pin `github:shedcollective/neat-os#vX.Y.Z` while `publish-npm.yml` stays paused. See [consume.md](../consume.md).
