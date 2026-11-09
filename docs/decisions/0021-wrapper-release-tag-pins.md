# 0021 — Bot wrappers pin a release tag

**Status:** Accepted
**Date:** 2026-10-20

## Context

Wrappers that run agency operations playbooks name a git ref for the playbook they follow. The convention allowed `main` or a release tag and told people not to pin `develop`. Live wrappers still pinned `develop`, so an unreleased change on the integration branch could change a live routine. `scripts/check-policy.js` is at its cap of ten, so a new prose policy is not the place for the check.

## Decision

A wrapper pins a **release tag** (`vX.Y.Z`). `main` is a stopgap only. `develop` and other branches are never a pin. The wrapper template stops when the pin is `develop` or any branch other than `main`. `scripts/check-structure.js` fails when that template's GitHub ref is not a release tag. Filled wrappers live outside this repository. The check covers the template. After a release, bump the tag with one pull request per wrapper, canary first, revert to roll back. The rule is [conventions/routine-settings.md](../../conventions/routine-settings.md). The upgrade path is [docs/consume.md](../consume.md#move-a-wrapper-pin).

## Consequences

A live routine does not pick up unreleased playbook changes. Moving to a new tag is a reviewed pull request, not an automatic follow of `main` or `develop`. Real wrappers are not in this tree, so the check cannot see them. Checking filled pins waits for agent workspaces ([issue #15](https://github.com/shedcollective/neat-os/issues/15)).
