---
name: gather
description: After init’s unfilled IDE-spread scaffold, fill AGENTS.md / `.agents/README.md` / `.agents/project.md` from repo evidence (scan may be non-interactive) plus a required interview for Client / Product and similar unknowns. Scan ≠ done. Do not invent facts. Do not copy company skills. Do not use as learn.
---

# gather

Fill the **IDE spread** that `init` scaffolded. Two jobs, in order:

1. **Repo evidence** — light-scan the tree and write a start-ready Agent Guide (`AGENTS.md` + `.agents/README.md`) and `.agents/project.md` (layout, Docker/Make, stack, CI, cited notes, consume mode). **Ascertain platform leaves:** when the tree shows distinct surfaces (e.g. frontend + backend, app vs web), write focused guides under `.agents/platforms/` and put **clear links** in `AGENTS.md` **Platform leaves**. Single-surface repos keep one guide — do not invent a split. **Ascertain stack packs:** when the tree's frameworks match a `stacks/<name>/` directory in the resolved neat-os tree, replace **Stack packs** in `AGENTS.md` with paths to those files. Do not copy the pack into the product repo. When no pack exists, leave "None yet". The scan **may run non-interactively** (Cloud Agent / CI).
2. **Interview** — chat Q&A that patches those same files (and any platform leaves) with unknowns that are **not** sitting in the tree (especially **Client** and **Product**, plus environments, deploy vendor, ticket prefix as applicable).

Do not invent answers. Do not pick a stack for the human. Do not re-ask **company conventions**. Do not copy company skills into `.agents/skills/`. Do not copy `stacks/` into the product repo. This is **not** `learn` (learn only proposes skill elevations).

The filled Agent Guide shape (Critical Docker / Makefile / nested `www/` / stack / cited ops notes) belongs **here**, not in `init`. `init` only drops the empty template slots.

## Completion (scan ≠ done)

The evidence scan is **not** gather finishing. `gather` is **not complete** until the interview.

| State | What it means |
| --- | --- |
| Scan-only | Passport / Agent Guide has tree facts. Client and Product are **Awaiting interview**. `gather` is **incomplete**. |
| Interview done | Client and Product in `.agents/project.md` are real answers (not blank bullets, not “awaiting interview”). Similar unknowns filled as applicable (environments, deploy vendor). |

**Done only when** the interview fields are filled — especially **Client** and **Product**. Empty `- Client:` / `- Product:` bullets look wrong; keep a clear **Awaiting interview** block until a human answers. Do not stuff Docker/Make into product scope.

## Interaction (IDE vs Cloud Agent)

Interview is **chat Q&A that patches files**. It is not a second repo scan.

| Context | What to do |
| --- | --- |
| **Evidence scan** | Always run `light-scan.sh`. Cloud Agents may do this hands-off. |
| **Interview — IDE / human in the loop** | Ask in batches. Patch `.agents/project.md`, `AGENTS.md`, and `.agents/README.md` with the answers. Then gather is complete (remaining `to confirm` items stay visible). |
| **Interview — Cloud Agent** | Hands-off unless answers were **pre-supplied** in the user prompt (or a ticket prefix via `--ticket-prefix` / `NEAT_OS_TICKET_PREFIX`). Do **not** invent Client/Product. Leave **Awaiting interview**, say gather is incomplete, and stop. |
| **Pre-supply answers** | Put them in the prompt, then patch files. Example: `Client: Acme. Product: marketing WordPress site. Envs: local / staging / production on DigitalOcean. Deploy: DeployHQ.` Optional later: env/flag hooks for client/product — not required if this prompt form is used. |

## Dual-mode consume

Locate neat-os the **same locked way `init` does** (`resolve-consume.sh` / `require('@shedcollective/neat-os').resolveConsume()`). Copying skills into the client is **not** a consume path.

Stop at the first hit:

1. **`NEAT_OS_ROOT`** (absolute, valid tree)
2. **`node_modules/@shedcollective/neat-os`** (walk up or `require.resolve`) — Local/IDE git pin
3. **`vendor/shedcollective/neat-os`** — Composer; PHP metadata only
4. **`../neat-os`** — Cloud Agent sibling / local OS development

`SHED_OS_ROOT`, `node_modules/@shedcollective/shed-os`, `vendor/shedcollective/shed-os`, and `../shed-os` still resolve when the neat-os name is absent. Each prints a deprecation warning.

**Do not** search the public web for “neat-os” or invent install steps. If 1–4 miss, tell the human how to install (git pin / sibling) and stop.

| Mode | When | How agents resolve skills / this scan |
| --- | --- | --- |
| **Installed dep** | Local / IDE / often a single clone | Node: `require('@shedcollective/neat-os').skillsDir` after `file:` / `github:shedcollective/neat-os#vX.Y.Z` → `node_modules/`. Composer `vendor/` is PHP metadata only. |
| **Sibling / live tree** | Cloud Agents (multi-repo: client + neat-os). Proven. | `NEAT_OS_ROOT` or `../neat-os/skills` **after** 1–3 miss. Run `skills/gather/scripts/light-scan.sh` from that tree. |

Do not invent a Packages registry, `NODE_AUTH_TOKEN`, or DeployHQ secrets.

## When to use

- `init` has copied the **IDE spread structure** and slots are still template / `{{to confirm}}` / **Awaiting interview**.
- A human wants a start-ready Agent Guide from the tree, then client intent captured.
- Re-running after more evidence appeared in the repo (new Makefile, Compose, nested app root).
- Re-running to **interview** after a scan-only Cloud Agent pass.

## When not to use

- Replacing `init`. If `AGENTS.md` / `.agents/` is missing, run `init` first (or say so and stop).
- Treating gather as “copy templates and stop” — that is `init`.
- Treating gather as “scan `package.json` / Docker / Make and stop” — that is scan-only; gather is still **incomplete**.
- Legacy or mature repos with existing **rich** product truth — update slots from files you have read, or stop and ask. Do not run a greenfield questionnaire over known facts.
- Filling company-wide principles, conventions, or org skills — that belongs in `neat-os` via a human PR (`learn` may **propose** only).

## Preconditions

1. Confirm git root (`git rev-parse --show-toplevel`).
2. If `AGENTS.md` or `.agents/` is missing, run `init` first (or say so and stop). Init scaffolds **unfilled** gist slots only.
3. Read neat-os `conventions/` from the consume path — not from a copied `.agents/skills/`. Same resolve order as `init`: `NEAT_OS_ROOT`, then `require('@shedcollective/neat-os').conventionsDir` after `file:` / `github:`, then sibling `../neat-os`, else this clone. Treat those files as locked defaults.
4. Read `.agents/README.md` (Agent Guide template or existing guide), `.agents/project.md`, and `AGENTS.md`. If a hand-written (non-template) Agent Guide or `AGENTS.md` already exists, cite it — do not clobber it and do not append scan sections to it (the scan reports it under `cited:`). If Client/Product is already richly filled (not a package description, not **Awaiting interview**), this is **not** a blank greenfield — extend gaps only.

## Steps

1. **Evidence passport (light scan).** From the target root:

   ```bash
   bash "$NEAT_OS_ROOT/skills/gather/scripts/light-scan.sh"
   ```

   Or pass the target: `light-scan.sh /path/to/project`.

   Infer **only** from repo evidence. Write a start-ready Agent Guide into `.agents/README.md` **and** the matching sections of `AGENTS.md` / `.agents/project.md` — not a handful of lockfile bullets or a skills-pointer stub. Typical evidence:

   - **Nested app roots:** `www/`, `app/`, and other dirs with `composer.json` / `package.json` / `artisan` / `wp-content`
   - **Docker / Make:** `docker-compose.yml` / `compose.yml` / `Dockerfile` (services, images, ports) and Makefile **targets + real recipes** — these become **Critical Docker rules** and the Makefile section. Keep them out of Client & product.
   - **Generated paths:** compiled output directories (`assets/build`, `public/build`) and rewrite commands (`routes:rewrite`). These become the **Generated paths** section. Do not treat them as source.
   - **Directory shape:** high-level tree under repo root and each app root (do not dump the whole tree)
   - **Stack:** `composer.json` / `package.json` (including nested) and lockfiles; WordPress / Laravel / Nails / Node frameworks — woven into overview / architecture
   - **CI:** workflow **names + jobs**, and what they imply if obvious from those names (`test`, `lint`, `deploy`)
   - **Existing notes:** cite `.agents/docs/`, `.agents/features/` (other than `TEMPLATE.md`), and `.agents/dependencies/pins.md`. Do **not** overwrite a hand-written `.agents/README.md`. Do not cite the unfilled template as if it were project truth.
   - **Branch / consume:** `origin/HEAD` or local `develop` / `main`; whatever `resolve-consume.sh` reported
   - **Platform leaves (when beneficial):** distinct frontend vs backend (or app vs web / other named surfaces) signals — separate manifest roots, FE frameworks (React/Vue/Next/…) plus BE (PHP/Laravel/WordPress/Express/…), or dirs named `frontend` / `backend` / `web` / `api` / similar. When **two or more** surfaces are evident, write `.agents/platforms/<surface>.md` leaves (from evidence only) and replace the **Platform leaves** section in `AGENTS.md` with clear links to each leaf. When only one surface is evident, leave the platforms slot empty (README + TEMPLATE only) and keep AGENTS.md “None yet”. Do **not** invent a split. Do **not** clobber a hand-written leaf unless `--force`.
   - **Stack packs (when a pack exists):** Nails / Laravel / WordPress (and later stacks) from composer and the tree. When a matching `stacks/<name>/` directory exists in neat-os, replace **Stack packs** in `AGENTS.md` with the pack's markdown paths, resolved the same way as playbooks. Do **not** copy the files. Do **not** invent a pack that is not in neat-os. Laravel and WordPress stay "None yet" until those packs exist.

   When a section has no evidence, mark it **Awaiting interview** / gather-next / `to confirm`. Do **not** invent a client brief, DeployHQ secrets, hosting vendor, or environments. A package `description` may be a **tree hint** only — never the Product paragraph. Leave `{{PROJECT_NAME}}` / `{{TICKET}}` replaced (ticket key or `TICKET`), not as leftover mustache.

   Re-running the scan must not clobber real (non-placeholder) interview answers unless the human confirmed `--force`.

2. **Ticket prefix.** Ask or mark — never guess a key. Which system a repo uses is a company fact ([conventions/tickets.md](../../conventions/tickets.md)): client repos use a Jira key (`ACME`), neat-os and `neat-os-tool-*` leaves use GitHub Issues (`GH`).

   | Path | What to do |
   | --- | --- |
   | **OS repo** (neat-os checkout or a `neat-os-*` leaf) | The scan writes `GH` from the convention. Do not ask. |
   | **Interactive** (human in the loop, TTY) | Ask once, e.g. “What is the Jira ticket prefix (ACME)?” Pass `--ticket-prefix=ACME` or let `light-scan.sh` prompt. |
   | **Flag / env** | `--ticket-prefix=ACME` on `light-scan.sh` (`--jira-prefix` is an alias), or `NEAT_OS_TICKET_PREFIX=ACME` (`NEAT_OS_JIRA_PREFIX` still honoured). |
   | **Non-interactive** (Cloud Agent, CI) | If no flag/env, leave a clear `TODO / ask` marker on the ticket-prefix slot. |

   Document the unanswered prefix in Gather next. Confirm or replace it during the interview.

3. **Interview remaining unknowns.** Required for gather to be complete. Ask in batches when a human is in the loop. If this is a Cloud Agent and answers were **not** pre-supplied, skip asking, keep **Awaiting interview**, and stop (incomplete). Prefer the human's words over guesses. Skip anything the evidence scan already answered unless you need to confirm.

   **Client & product** (required)

   - Who is the client, and what is the product in one paragraph?
   - What is in scope for this repo vs other repos/systems?
   - Any names, domains, or data that must **not** be renamed or exposed?

   **Stack (ask; do not lock a default)**

   The scan may already have languages/frameworks, Docker/Make start commands, and CI workflow names from the tree. Confirm versions, lockfile SoT, and anything the passport missed:

   - Languages, frameworks, CMS, and major libraries — including versions if known?
   - Package manager(s) and lockfiles that should be treated as SoT? Confirm what the scan found. Do not offer npm when `yarn.lock` is present, or Yarn when `package-lock.json` is present ([conventions/lockfile.md](../../conventions/lockfile.md)).
   - Hosting, CI, and deploy (e.g. GitHub Actions, DeployHQ, DigitalOcean) — actual, not hoped-for? Do **not** invent DeployHQ config or secrets.

   **Environment & project git**

   - Ticket prefix: Jira key (client repo) or GitHub Issues (`GH`, OS repo)? Confirm or fill the `TODO / ask` marker.
   - Environments (local / staging / production) and how they differ?
   - macOS vs WSL2 (Linux filesystem) constraints for this team?
   - Only if the integration branch might not be `develop`: what is it named?

   **Tickets** (read later by the `ticket` playbook; the shape and tone are company rules in [conventions/ticket-content.md](../../conventions/ticket-content.md), so ask only for what differs per project)

   - Jira site URL (or the GitHub repo for an OS repo)?
   - Default labels or components a new ticket should carry, if any?
   - The client's own names for environments, features and roles (for example "UAT" rather than "staging")?
   - Standing acceptance criteria every ticket carries (for example "Done when the change is on UAT and the client has signed it off")?

   **Do not ask**

   - Git workflow (git-flow vs trunk vs other). It is always **git-flow** — neat-os `conventions/git.md`. Write that into the project slots; do not offer a choice.
   - Which JavaScript installer to use when exactly one of `yarn.lock`, `package-lock.json`, or `pnpm-lock.yaml` sits next to a given `package.json`. The lockfile names it ([conventions/lockfile.md](../../conventions/lockfile.md)). Nested package.json files are separate roots. If two JavaScript lockfiles exist in the same directory, stop and surface the conflict.

   Mark remaining gaps as `to confirm` or leave **Awaiting interview**. Never fill a slot with a guessed stack. Do not wipe a correct evidence fact to make the file look “gathered.”

4. **Write interview answers** into the same files the scan filled:

   - **`.agents/project.md`** — structured answers (client, product, env, ticket prefix, the Tickets slot, gather-next). Replace the **Awaiting interview** block with real bullets. Leave a Tickets bullet as "none" when the answer is none; do not invent labels or vocabulary. Set git workflow to git-flow from company conventions, not from a guess. Keep Docker/Make under Layout & start.
   - **`AGENTS.md`** and **`.agents/README.md`** — replace remaining placeholders in Project / Overview, client brief, environments, gotchas **only where the human answered**. Keep Docker/Make evidence. Keep git-flow. Keep **Platform leaves** links accurate when leaves exist. Keep **Stack packs** paths accurate when a pack matched. Leave remaining TODOs visible.
   - **`.agents/platforms/*.md`** — if leaves were created, patch surface-specific unknowns the human answered; do not dump full-repo stack into every leaf.
   - Do **not** write company skills into this project. Do **not** copy neat-os skills into `.agents/skills/`. Do **not** copy `stacks/` into the product repo. Do **not** copy answers into `neat-os`.

5. **Stop.** State whether gather is **complete** (interview filled) or **incomplete** (scan-only / Awaiting interview). Summarise what the scan inferred, what the human answered, and what remains. Commit only if the human asked. Next is implementation — not `learn`, unless someone asked “what should become a skill?”
