# 0010 — v0.1.0 is the first installable tag; v0.0.1 is not

**Status:** Accepted
**Date:** 2026-09-10

## Context

Tag `v0.0.1` was created on `main` before this repository had a root `package.json`. That pull request is recorded in the archive repository. `npm install github:shedcollective/shed-os#v0.0.1` cannot resolve `@shedcollective/shed-os`. Docs later told people to pin that tag. `learn` recorded the pattern in a draft kept in the archive repository.

## Decision

`v0.1.0` is the first tag a product repository may pin. `v0.0.1` is not installable and must not appear as an install path. A tag is a promise that `npm install` of that ref works: CI installs this commit by SHA into a scratch consumer on every run, and `release-smoke.yml` repeats the install from the published tag and asserts `skillsDir` exists and `resolveConsume().mode` is `node_modules`. Do not delete a published tag that fails that test. Publish the next patch and say in its notes that it replaces the broken one. `publish-npm.yml` stays paused ([0001](0001-consume-via-git-not-packages.md)).

## Consequences

Until a person publishes `v0.1.0` on `main`, product repositories pin `#develop` or a commit SHA. Historical mentions of `v0.0.1` stay as a warning, not a recipe. The version in the root `package.json`, `packages/npm/package.json`, both `composer.json` files, and `ShedOs::VERSION` must match the tag they will become. Composer skips a tag whose `composer.json` declares a different version.
