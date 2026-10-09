# 0013 — Stack packs live in shed-os; init and gather point at them

**Status:** Accepted
**Date:** 2026-10-01

## Context

Stack-specific rules (Nails Factory, Laravel jobs, WordPress hooks) have nowhere company-wide to live except a product Agent Guide. A request recorded in the archive repository asked for separate `shed-os-platform-*` repositories. After discussion on 1 Oct 2026, stack guidance stays in this repository so `init` and `gather` can point a product repo at the matching pack from the same resolve order as playbooks ([ADR-0003](0003-resolve-order.md)). Product `.agents/platforms/` already means frontend and backend surface guides, so the two must not share a folder name.

## Decision

Company stack guidance lives under `stacks/<name>/` in this repository. Each pack is playbook-shaped markdown, indexed by that pack's `README.md`. `init` leaves an empty **Stack packs** slot in `AGENTS.md`. `gather` fills the slot from frameworks the tree already shows, and only when `stacks/<name>/` exists. Packs are read from the resolved shed-os tree. They are never copied into the product repo (same rule as skills, [ADR-0004](0004-ide-spread-no-skill-copy.md)). Separate `shed-os-platform-*` repositories are not created. That request is superseded. `shed-os-tool-*` is unchanged.

## Consequences

A Nails product repo, after gather, is pointed at `stacks/nails/`. A WordPress tree with no pack still has "None yet". Laravel and WordPress packs wait for a proposal; gather does not invent them. Adding a pack is a pull request in this repository, not a new GitHub repo. Product frontend and backend leaves stay under `.agents/platforms/`.
