# 0009 — Reader-facing pages are written for a developer who has only the repository

**Status:** Accepted
**Date:** 2026-09-09

## Context

The first docs pass for v0.1.0, recorded in the archive repository, read like the working notes it grew out of. Pages cited a team plan, meeting dates, a Notion workspace, and the internal step numbers of the batch. Sentences leaned on symbols (`≠`, `→`) and em dashes instead of words, and used several names for one thing ("launch skill", "playbook", "IDE spread", "gist"). A developer joining Shed could not follow the README without having been in the conversations that produced it.

## Decision

Reader-facing pages are written for a developer on their first day who has this repository open and nothing else. The rules are locked in [conventions/writing.md](../../conventions/writing.md): references must be openable from the repo, one page does one job, a fact is stated once and linked, sentences use plain words and no symbol shorthand, and each thing has one name. `scripts/check-policy.js` enforces the subset software can see (em dashes, `≠`, a short list of filler words, and ticket sub-step references) on `README.md`, `docs/*.md`, `packages/*/README.md`, and `conventions/*.md`. The rest is review.

## Consequences

Pages get longer in words and shorter in decoding. Principle `Source` lines cite files, pull requests, and issues, not meetings. The convention is a page under `conventions/`, so `gather` does not ask about writing style and templates inherit it. A skill that applies the rules mechanically to a draft is a possible later addition through a `learn` proposal; this decision does not create one. Agent-facing files (`SKILL.md`, `AGENTS.md`) are outside the check because they are pinned by other policies and are read by scanning, not reading.
