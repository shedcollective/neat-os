# Platform leaves

Focused agent guides for **distinct surfaces** in this repo (frontend, backend, app vs web, …). `init` scaffolds this slot. `gather` ascertains whether a split helps and writes leaf files when the tree shows more than one surface. Canonical cross-IDE rules stay in [../../AGENTS.md](../../AGENTS.md); operational overview in [../README.md](../README.md).

## When leaves exist

AGENTS.md lists each leaf with a clear link. Prefer the leaf that matches the work surface so agents load less context. Shared git-flow, company consume path, and cross-cutting gotchas remain in AGENTS.md.

## When none exist

Single-surface repos keep everything in AGENTS.md / the Agent Guide. Do **not** invent a frontend/backend split.

## Adding a leaf

Copy [TEMPLATE.md](TEMPLATE.md) to `{{surface}}.md` (e.g. `frontend.md`, `backend.md`). Fill from evidence only. Link it from AGENTS.md **Platform leaves**.
