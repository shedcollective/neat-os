# {{PROJECT_NAME}} — agent guide

Canonical agent guide — other agent files symlink/include this. Edit here only.

Knowledge is **repo-bound** (this git repo) so Cursor cloud agents can run without an IDE plugin. Do **not** invent client or stack facts. Do **not** read host or IDE session memory (`.claude/projects/`, Cursor memories) for project facts; write durable facts into this repository. `init` scaffolds this file (placeholders OK). `gather` fills it **and** the operational [`.agents/README.md`](.agents/README.md) Agent Guide from repo evidence (Docker/Make/stack/layout/start) plus interview. Uncertainties: `to confirm`.

Company playbooks (`init`, `gather`, `learn`, `ticket`, `assurance`, `pin-majors-with-reasons`, `cloud-agent-environment`) live in [shedcollective/neat-os](https://github.com/shedcollective/neat-os). To put work into Jira, follow `ticket`; it reads the Tickets section of [`.agents/project.md`](.agents/project.md) and writes to Jira only, never to this repository. Resolve in this order and stop at the first hit: `NEAT_OS_ROOT`, then `require('@shedcollective/neat-os').skillsDir` after `file:` / `github:` (`node_modules/`), then sibling `../neat-os`. `SHED_OS_ROOT` and the shed-os paths still resolve and are deprecated. Do **not** search the public web for neat-os. Do **not** copy them into `.agents/skills/`. **`learn` may propose elevation only** — never auto-promote into neat-os or platform/tool leaves; a human opens that PR.

## Project

{{one paragraph: client + product. to confirm}}

## Stack

- Languages / frameworks / versions: {{to confirm}}
- Package manager / lockfile SoT: {{to confirm}}
- Hosting / CI / deploy: {{to confirm}}

## Stack rules

Load-bearing decisions, rationale, and where each lives. {{to confirm — do not guess}}

## Project-specific rules

Domain gotchas and "do NOT rename X". {{to confirm}}

## Git workflow

Company default: **git-flow** ([neat-os conventions/git.md](https://github.com/shedcollective/neat-os/blob/develop/conventions/git.md)). Not a per-project choice.

- Integration branch: `develop` (PRs land here)
- Production branch: `main`
- Feature branches from `develop`, merge back to `develop`; hotfixes from `main`
- Agents open PRs **into `develop` only**; humans merge. One feature in several steps is a stack ([conventions/git.md](https://github.com/shedcollective/neat-os/blob/develop/conventions/git.md))
- Commits: Conventional Commits (`feat|fix|chore|refactor|docs|test|style`) with the ticket key — Jira for client repos (`ACME-42`), GitHub Issues for OS repos (`GH-42`) ([conventions/tickets.md](https://github.com/shedcollective/neat-os/blob/develop/conventions/tickets.md)). Commit shape (one concern, what and why, documentation first, then an order a reviewer can follow) is locked in [conventions/git.md](https://github.com/shedcollective/neat-os/blob/develop/conventions/git.md)
- PR titles: `[<KEY>] <type>: <description>` (stacked steps add `(<step>/<total>)` after the key; [conventions/git.md](https://github.com/shedcollective/neat-os/blob/develop/conventions/git.md#pr-titles))
- Feature plans: `.agents/features/{{TICKET}}-overview.md` (ticket key lowercase in the filename, e.g. `acme-42-overview.md` / `gh-42-overview.md`; branch names stay lowercase with the `feature/` prefix, e.g. `feature/acme-42-checkout`)

## Repo structure

{{annotated tree — derive from the repo; do not invent}}

## Local setup

Exact commands per sub-project, verified in-repo.

- Team machines are macOS or Windows via WSL2. **On WSL2 the repo must live on the Linux filesystem** (e.g. `~/GitRepos/…` on ext4), never under `/mnt/c/…`.

## Known gotchas

{{traps that bite agents, including cross-OS: WSL2 localhost forwarding, file-watchers, toolchain version parity. to confirm}}

## Platform leaves

None yet. `gather` creates focused guides under [`.agents/platforms/`](.agents/platforms/) when the tree shows distinct surfaces (e.g. frontend + backend, app vs web). Shared cross-cutting rules stay in this file and [`.agents/README.md`](.agents/README.md). Start a new leaf from [`.agents/platforms/TEMPLATE.md`](.agents/platforms/TEMPLATE.md) only when a split helps agents load less context.

## Stack packs

None yet. `gather` points at `stacks/<name>/` in the resolved neat-os tree when the repo's frameworks match a pack that exists. Stack rules are read from neat-os. They are never copied into this repository.

## Feature docs

Check `.agents/features/` for a relevant plan before working in any area. New plans start from `.agents/features/TEMPLATE.md`. Dependency pins: `.agents/dependencies/pins.md`. Living reference docs: `.agents/docs/`. Platform-specific brief: `.agents/platforms/` when gather (or a human) split surfaces.
