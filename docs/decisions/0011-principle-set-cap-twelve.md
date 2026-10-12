# 0011 — Principle set cap is twelve

**Status:** Superseded by 0018
**Date:** 2026-09-10

## Context

`scripts/check-structure.js` fails when `principles/` has more than ten leaves (goal files excluded). Elevating two new judgement rules (`use-the-declared-runtime` and `keep-the-guide-true`) without raising the cap makes the second merge fail the required check.

## Decision

The structure check allows at most twelve principle leaves. The rule is still "keep the set small; delete leaves that stop changing behaviour." Crossing twelve needs a new ADR, not a quiet bump in the script.

## Consequences

Eleven and twelve are legal. A thirteenth leaf is a defect until a later ADR raises the cap or an existing leaf is deleted. `docs/contributing.md` matches this number.
