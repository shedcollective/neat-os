# 0018 — The principle set has no numeric cap

**Status:** Accepted
**Date:** 2026-10-12

## Context

[0011](0011-principle-set-cap-twelve.md) capped the principle set with a number, and the structure check enforced that number. A numeric cap blocks a principle that has earned its place, and the next step is a quiet bump of the number. Whether a principle belongs is a judgement at elevation.

## Decision

There is no numeric cap. Keep the set small. Delete a principle that stops changing behaviour. The elevation bar enforces that rule: a principle earns its place only if it changed a real decision in shipped work and cannot be checked by software. [0011](0011-principle-set-cap-twelve.md) is superseded. The structure check does not count principles.

## Consequences

A new principle no longer needs an ADR that raises a number. It still needs the elevation bar. A rule that software can check belongs in a convention or a script. `docs/contributing.md` matches this decision.
