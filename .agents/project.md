# Project knowledge

Filled by **gather** (repo evidence + interview) after **init** scaffolds these slots, or by humans from known project truth. Agents must not invent answers.

Gather is **complete** here: the scan ran and the interview answers below are real (pre-supplied by a maintainer). A scan-only passport would be a start, not a finish.

Operational Agent Guide: [README.md](README.md). Canonical cross-IDE rules: [../AGENTS.md](../AGENTS.md). Platform leaves (when split): [platforms/](platforms/).

## Client & product

Interview answers pre-supplied by a maintainer. Docker/Make evidence stays under Layout & start.

- Client: none. This repository is the reference, so it has no external client.
- Product (one paragraph): The agency AI operating system. A git-bound knowledge tree that every Shed repo consumes: three goals (Kaizen, Determinism, Parallelism) and the principles beneath them, locked engineering conventions, six playbooks (`init` scaffolds an IDE spread, `gather` fills it from evidence plus interview, `learn` proposes skill elevations, `ticket` writes a ticket, `assurance` posts an evidence pack on a pull request, `pin-majors-with-reasons` upgrades dependencies without moving a pinned major), the templates `init` copies, a mechanism taxonomy, and the ADRs recording why locked behaviour exists. `init`, `gather`, and `learn` are the launch playbooks. Consumed by Local/IDE agents as a git-pinned npm package and by Cloud Agents as a sibling checkout.
- In scope / out of scope: In scope — everything company-wide and stack-agnostic listed above, the `scripts/check` pipeline, the npm/Composer consume metadata, and stack packs under `stacks/` (ADR-0013). Out of scope — any client or project fact (those live in each product repo's `.agents/`), tool wrappers (future `neat-os-tool-*`), and the Notion scratchpad (not a source of truth — ADR-0008).
- Names or data that must not be renamed or exposed: package names `@shedcollective/neat-os` and `shedcollective/neat-os`; the env var `NEAT_OS_ROOT` (`SHED_OS_ROOT` is a deprecated fallback); the resolve order and mode names (`env`, `node_modules`, `vendor`, `sibling`, `checkout`, `missing`), ADR-0003; the slot paths `AGENTS.md`, `.agents/README.md`, `.agents/project.md`, `.agents/platforms/`, `.agents/features/`, `.agents/proposals/`, `stacks/`. No client names appear in this repo.

Tree hint (package description, **not** a client brief): From `package.json`: Shed agency OS. Principles, playbooks, and project templates. Install from GitHub Packages, or from git (file: sibling or github:shedcollective/neat-os#vX.Y.Z).

## Stack

- Languages / frameworks / versions: PHP >=8.1, JavaScript
- Package manager / lockfiles: composer.json (Composer), package.json (npm)
- Hosting / CI / deploy: GitHub Actions: `publish-npm.yml` (name: Publish npm, jobs: publish — deploy); `validate.yml` (name: Validate neat-os, jobs: validate — tests). No hosting: this is a knowledge repo. "Deploy" is a GitHub Release tag `vX.Y.Z` on `main` that consumers pin (`github:shedcollective/neat-os#vX.Y.Z`); that Release publishes the package to GitHub Packages (ADR-0019). The licence is MIT. No DeployHQ.

## Layout & start (repo evidence)

- App root(s): repo root (repo-root manifest; PHP >=8.1, JavaScript)
- Containers / Compose: none found in the tree
- Makefile / task runner: none found in the tree
- How to start (from evidence): `npm test` — `bash scripts/check` (package.json scripts; no Makefile or Compose in the tree)

## Existing notes

- Cited notes: `.agents/README.md` — existing Agent Guide, not overwritten; headings: .agents; `README.md` — headings: neat-os, Dual-mode consume (sibling vs installed dep)

## Environment & workflow

- Git workflow: git-flow (company default — not a gather question)
- Integration branch (usually `develop`): develop
- Ticket prefix: GH (GitHub Issues — OS repo, per neat-os conventions/tickets.md; not a gather question)
- Environments (local / staging / production): none in the runtime sense. `develop` is the integration branch, `main` holds tagged releases; a consumer's pinned tag is the only "environment". Working inside this checkout is consume mode `checkout` (see [../AGENTS.md](../AGENTS.md) → Working in this checkout).
- OS notes (macOS / WSL2): company default applies (macOS or WSL2 on the Linux filesystem). Node 22 and bash are the only host requirements; no Docker. `NEAT_OS_ROOT`, when set, must be an absolute path — a relative value is skipped with a warning.

## Tickets

Read by the `ticket` playbook. Shape and tone: [../conventions/ticket-content.md](../conventions/ticket-content.md). This is an OS repo, so tickets are GitHub Issues ([../conventions/tickets.md](../conventions/tickets.md)).

- Ticket site URL: [github.com/shedcollective/neat-os/issues](https://github.com/shedcollective/neat-os/issues). Issues opened before the 0.4.0 cutover remain in the archive repository.
- Default labels or components on a new ticket: none
- Client vocabulary: none (no client; the readers are maintainers and agents)
- Standing acceptance criteria every ticket carries: "Done when `bash scripts/check` passes on the pull request that closes this issue."

## Company knowledge

How this project consumes neat-os (resolve and stop at the first hit: `NEAT_OS_ROOT`, then `github:shedcollective/neat-os#vX.Y.Z` or `file:../neat-os` → `node_modules/`, then Composer `shedcollective/neat-os` → `vendor/` which is PHP metadata only and does not ship skills/templates, then sibling `../neat-os`). `SHED_OS_ROOT`, `@shedcollective/shed-os`, and `../shed-os` still resolve and are deprecated. Do not search the public web for neat-os. Do not copy skills into this repo. Evidence passport: consume mode **checkout**.

## Gather next

`gather` is **complete** for this repo (scan 9 Sep 2026 + pre-supplied interview). Remaining `to confirm` items:

- None. Re-run `bash skills/gather/scripts/light-scan.sh` after adding a Makefile, Compose file or CI workflow; the evidence sections refill, the answers above stay.
