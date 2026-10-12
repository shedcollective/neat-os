# 0018 — Principle set cap is thirteen

**Status:** Accepted
**Date:** 2026-10-12

## Context

[0011](0011-principle-set-cap-twelve.md) caps the principle set at twelve. [never-store-secrets](../../principles/never-store-secrets.md) is a thirteenth principle: this repository does not store secrets, credentials, or project-specific information. The structure check rejects that file until the cap moves.

## Decision

The structure check allows at most thirteen principles. Keep the set small, and delete a principle that stops changing behaviour. Crossing thirteen needs a new ADR. Do not bump the script on its own. [0011](0011-principle-set-cap-twelve.md) is superseded.

## Consequences

Thirteen principles are legal. A fourteenth is a defect until a later ADR raises the cap or an existing principle is deleted. `docs/contributing.md` matches this number.
