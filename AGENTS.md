# neat-os — agent guide

Canonical guide for agents working **in this repository**. Edit here only.

This is the Shed agency OS core: shared principles, launch skills, and the project scaffold that `init` copies into other repos as an **IDE spread** structure (Agent Guide + slots). `gather` fills that spread from repo evidence plus interview. Knowledge is **repo-bound** so Cursor cloud agents can run without an IDE plugin.

**Dual-mode consume:** Local / IDE installs `github:shedcollective/neat-os#vX.Y.Z` into `node_modules/` (or Composer VCS into `vendor/`). That install is vendoring. Cloud Agents use a sibling client + neat-os (`NEAT_OS_ROOT` / `file:`). Both share this resolve order (stop at the first hit): `NEAT_OS_ROOT` → `node_modules/@shedcollective/neat-os` → `vendor/shedcollective/neat-os` → `../neat-os`. `SHED_OS_ROOT`, `@shedcollective/shed-os`, `vendor/shedcollective/shed-os`, and `../shed-os` still resolve, and each prints a deprecation warning. Agents and Cloud Agents install with that git pin. A product repository may install the published package from GitHub Packages. The recipe is in [docs/consume.md](docs/consume.md). An agent token gets a 403 from that registry, so agents do not use it ([ADR-0019](docs/decisions/0019-publish-github-packages.md)). Do **not** search the public web for “neat-os init”. `init` must **not** copy company skills into a client `.agents/skills/`.

## Where things live

- [principles/](principles/README.md) — three goals (Kaizen, Determinism, Parallelism) and the short principle leaves under them; read the index at task start
- [conventions/](conventions/README.md) — locked engineering defaults (git-flow, ticket systems, ticket content)
- [skills/](skills/) — launch and on-demand playbooks in `SKILL.md` format (`init`, `gather`, `learn`, `ticket`, `assurance`, `pin-majors-with-reasons`, plus agency ops: `daily-burndown`, `enhance-daily-update`, `project-update`, `client-brief`, `daily-digest`, `meeting-prep`, plus design and UX: `brand-from-site`, `design-qa`, `ux-audit`, `research-synthesis`). `ticket` writes to Jira or GitHub Issues only, never to a repository. Agency ops map: [docs/agency-ops.md](docs/agency-ops.md). Design and UX rules: [conventions/design-ux-agents.md](conventions/design-ux-agents.md)
- [templates/](templates/) — Agent Guide + project slots `init` copies into a target project (not company skills)
- [stacks/](stacks/) — stack packs (`nails/`, later Laravel and WordPress). `gather` points a product repo at the matching pack; they are not copied ([ADR-0013](docs/decisions/0013-stack-packs-in-shed-os.md))
- [schema/](schema/README.md) — mechanism taxonomy: principle / convention / playbook / skill / script / agent
- [docs/](docs/README.md) — implementer docs (consume, playbooks, release, contributing). The repo is the source of truth; never link to notes kept elsewhere (ADR-0008). Reader-facing pages follow [conventions/writing.md](conventions/writing.md)
- [docs/decisions/](docs/decisions/README.md) — ADRs; why a locked behaviour exists. Changing a locked behaviour means a new ADR
- [scripts/check](scripts/check) — the required check (`npm test`): structure → policy → neutral reference → smoke. `scripts/check-neutral.js` enforces [conventions/neutral-reference.md](conventions/neutral-reference.md). Run before every PR
- Root [package.json](package.json) — Node consume SoT (`file:` sibling or `github:shedcollective/neat-os#vX.Y.Z`; same git auth as Composer)
- [packages/npm](packages/npm/) — `@shedcollective/neat-os` implementation (path helpers + `resolveConsume()`; `NEAT_OS_ROOT` when working in this checkout)
- Root [composer.json](composer.json) — Composer VCS SoT for `shedcollective/neat-os`
- [packages/composer](packages/composer/) — PHP library tree (metadata only; knowledge is not shipped via Composer)

## Working in this checkout

This repo is itself a neat-os tree, so the launch playbooks run against it without any install. Facts that trip contributors:

- **Consume mode is `checkout`.** `bash skills/init/scripts/resolve-consume.sh` reports `mode: checkout` here; it is the last-resort hit after `NEAT_OS_ROOT` → `node_modules` → `vendor` → sibling (ADR-0003). Product repos never see this mode.
- **`NEAT_OS_ROOT` must be absolute.** A relative value (`../neat-os`) is skipped with a warning and resolution falls through to the next hit. Set it only when you need this checkout to win over an installed package: `export NEAT_OS_ROOT="$PWD"` from the repo root. Leave it unset for normal work here. `SHED_OS_ROOT` is a deprecated fallback.
- **Running the playbooks on this repo** (dogfood): `bash skills/init/scripts/copy-templates.sh` skips the hand-written `AGENTS.md` / `.agents/README.md` and scaffolds the slots; `bash skills/gather/scripts/light-scan.sh` fills [.agents/project.md](.agents/project.md), writes the `GH` ticket prefix from [conventions/tickets.md](conventions/tickets.md) without asking, and reports both guides under `cited:`. Re-run after adding a Makefile, Compose file or workflow; interview answers survive.
- **Host requirements:** Node 22 and bash. No Docker, no npm dependencies. `bash scripts/check` (also `npm test`) is the required check; run it before every push.
- **Project slots for this repo** live where they do for any product repo: [.agents/project.md](.agents/project.md), [.agents/features/](.agents/features/) (plan per ticket, e.g. `gh-42-overview.md`), [.agents/proposals/](.agents/proposals/) (`learn` drafts; elevated leaves link back to them). Drafts written before this tree was named neat-os are in the archive repository.

## Rules

- Do **not** invent client or project facts. `init` scaffolds empty/template IDE-spread slots only. `gather` fills them from repo evidence plus interview (Agent Guide, stack, Docker/Make, passport, ticket prefix). Do **not** re-ask [conventions/](conventions/README.md).
- Name roles, not people, clients, projects, products, or bots. The rule is [conventions/neutral-reference.md](conventions/neutral-reference.md) ([ADR-0016](docs/decisions/0016-neutral-reference.md)).
- Do **not** store secrets, credentials, or project-specific information in this repository. The convention is [never-store-secrets](conventions/never-store-secrets.md).
- Do **not** create `neat-os-platform-*` or `neat-os-tool-*` repos from this skeleton. Stack guidance lives under [stacks/](stacks/) ([ADR-0013](docs/decisions/0013-stack-packs-in-shed-os.md)).
- **`learn` may propose elevation only.** Never push skills to this repo, a platform leaf, or any org skill store. A human opens the PR.
- Prefer Conventional Commits (`feat|fix|chore|refactor|docs|test|style`). Tickets for this repo are GitHub Issues, keyed `GH-<n>` ([conventions/tickets.md](conventions/tickets.md)). Commit shape (one concern, what and why, documentation first, then an order a reviewer can follow) is locked in [conventions/git.md](conventions/git.md).
- **Git-flow:** branch from `develop` and open PRs **into `develop` only** (stacked PRs allowed, bottom-up). Release to `main` (tag) when shipping. Prefer merge commits, not squash.
- Write docs, PR bodies and commit messages for a reader who has only this repository ([conventions/writing.md](conventions/writing.md)). `scripts/check` fails reader-facing pages on the part of that convention software can see.
- When a principle shaped a decision in your work, name it in the PR and say what it changed. When a rule keeps being restated, make it a check in `scripts/` instead ([encode-lessons-in-structure](principles/encode-lessons-in-structure.md)).
