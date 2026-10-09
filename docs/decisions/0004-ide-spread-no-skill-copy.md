# 0004 — Keep the IDE spread in product repos; never copy company skills into a client

**Status:** Accepted
**Date:** 2026-09-07

## Context

Two failure modes appeared during the first product-repo smoke test: a "thin pointer" `.agents/README.md` that only said "skills live in shed-os" (useless to a new agent), and drafts that copied `skills/` into the client's `.agents/skills/` and called it vendoring.

## Decision

Product repos keep a rich, gist-shaped agent spread: `AGENTS.md`, an operational `.agents/README.md` Agent Guide, `.agents/project.md`, `features/`, `docs/`, `platforms/` (leaves only when `gather` finds distinct surfaces), `proposals/`. Company skills are read from the resolved install (ADR-0003) and are never copied into the client. Vendoring means `node_modules/` or `vendor/`. Multi-IDE fan-out is optional symlinks to `AGENTS.md`, kept while it earns its keep.

## Consequences

One copy of company knowledge per install, updated by version pin. Client repos carry project truth only. Platform leaves are evidence-driven, so single-surface repos stay single-guide.
