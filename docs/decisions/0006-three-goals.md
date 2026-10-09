# 0006 — Kaizen, Determinism, Parallelism are the goals; principles sit beneath them

**Status:** Accepted
**Date:** 2026-09-09

## Context

The 7 Sep 2026 meeting set three high-level goals. Until this decision they were the only content under `principles/`, as placeholders, and nothing read them. pstack showed a working shape: short one-rule principles indexed in one place, cited by the decision they changed.

## Decision

Kaizen, Determinism and Parallelism are **goals**. Under each sit a small number of **principles**: one rule, *applies when*, *the decision it changes*, *source*. `principles/README.md` is the index agents read at task start. A principle earns its place only if it changed a real decision in shipped work and cannot be a script. Candidates arrive via `learn` proposals or PRs; a human elevates. Mechanism definitions live in `schema/README.md`.

## Consequences

Principles become operative rather than decorative. The set stays small by rule; leaves that stop changing behaviour are deleted. Delivery playbooks (bug, feature, QA, release) and a router/mode skill are a later decision that will build on this index.
