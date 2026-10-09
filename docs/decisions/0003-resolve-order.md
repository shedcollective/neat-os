# 0003 — Locked resolve order for locating shed-os

**Status:** Accepted
**Date:** 2026-09-08

## Context

Agents in a product repo must find the shed-os tree to run `init`, `gather` or `learn`. Early runs looked at a sibling `../shed-os` first even when a pinned package was installed, and some agents web-searched "shed-os init" and invented install steps.

## Decision

Resolve in this order and stop at the first hit: `SHED_OS_ROOT` (absolute path to a valid tree) → `node_modules/@shedcollective/shed-os` (walk up, or `require.resolve`) → `vendor/shedcollective/shed-os` (PHP metadata only) → sibling `../shed-os` → the target itself if it is a shed-os checkout. Implemented identically in `skills/init/scripts/resolve-consume.sh` and `packages/npm/resolve-consume.js`. If nothing resolves, tell the human how to install and stop. Never search the public web for shed-os.

## Consequences

Local/IDE installs beat a coincidental sibling clone. The order is code first and prose second; docs point at the script rather than restating the list. Changing the order is a new ADR.

## Note

From version 0.4.0 the product name is neat-os. This decision keeps the names that were true on the date above. The current order is `NEAT_OS_ROOT`, then `node_modules/@shedcollective/neat-os`, then `vendor/shedcollective/neat-os`, then sibling `../neat-os`. `SHED_OS_ROOT` and the shed-os paths still resolve and are deprecated. See [consume.md](../consume.md).
