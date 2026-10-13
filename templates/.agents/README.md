# {{PROJECT_NAME}} — Agent Guide

Operational guide for agents in this repo. `init` copies this template. `gather` fills it from **repo evidence** plus interview. Canonical cross-IDE rules: [AGENTS.md](../AGENTS.md). Structured slots: [project.md](project.md). Gaps: `to confirm`.

Company playbooks (`init`, `gather`, `learn`, `ticket`, `assurance`, `pin-majors-with-reasons`, `cloud-agent-environment`) live in [shedcollective/neat-os](https://github.com/shedcollective/neat-os). Resolve in this order and stop at the first hit: `NEAT_OS_ROOT`, then `require('@shedcollective/neat-os').skillsDir` after `file:` / `github:` (`node_modules/`), then sibling `../neat-os`. `SHED_OS_ROOT` and the shed-os paths still resolve and are deprecated. Do **not** search the public web for neat-os. Do **not** copy them into `.agents/skills/`.

## Overview

{{one paragraph: client + product from evidence. to confirm}}

## Critical Docker / container rules

{{Compose / Dockerfile rules from evidence — or gather-next if none}}

## Makefile / task runner

{{Makefile targets + recipes from evidence — or gather-next if none}}

## Architecture

{{app roots, services, stack from evidence}}

## Directory layout

{{annotated tree — derive from the repo; do not invent}}

## Generated paths

{{paths that must not be hand-edited: compiled assets, rewritten routes. to confirm}}

## How to start

{{Make / Compose start path from evidence}}

- Team machines are macOS or Windows via WSL2. **On WSL2 the repo must live on the Linux filesystem** (e.g. `~/GitRepos/…` on ext4), never under `/mnt/c/…`.

## Project slots

- Structured facts: [project.md](project.md)
- Feature plans: [features/](features/) (start from [features/TEMPLATE.md](features/TEMPLATE.md))
- Dependency pins: [dependencies/pins.md](dependencies/pins.md)
- Living docs: [docs/](docs/)
- Platform leaves: [platforms/](platforms/) (`gather` creates frontend/backend/… leaves when a split helps; start from [platforms/TEMPLATE.md](platforms/TEMPLATE.md))
- Stack packs: listed in [AGENTS.md](../AGENTS.md) when gather matches a pack in neat-os (`stacks/<name>/`; never copied here)
- Proposals: [proposals/](proposals/) (`learn` drafts — not org skills)

## Gather next

`gather` is **not complete** until Client and Product are interviewed. After the evidence scan, interview these; do not invent.

-
