# 0008 — The repository is the source of truth; Notion is a scratchpad

**Status:** Accepted
**Date:** 2026-09-09

## Context

During the first build week, Notion held more current truth than the repo (consume lanes, team setup, docs plan, meeting locks). That is the wrong way round for a system whose principle is repo-bound knowledge readable by Cloud Agents, and it risks forked recipes.

## Decision

Documentation, decisions (this folder) and release history live in `shedcollective/shed-os` on GitHub: docs in `README.md` and `docs/`, discussion in Issues and PRs, release notes on GitHub Releases. Notion is a personal scratchpad and a working surface with bots; repo files never link to it, and Notion content is ported once rather than kept in sync.

## Consequences

One place to read, one place agents can reach. Porting work is a one-off (the v0.1.0 docs phase). Anything that ends up written in both places is a defect to fix in the repo.
