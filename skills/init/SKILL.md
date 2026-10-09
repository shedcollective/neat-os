---
name: init
description: Scaffold only — copy the gist IDE spread structure (AGENTS.md, `.agents/README.md` Agent Guide template, docs/features/proposals slots) into a git repo and ensure a neat-os consume path (node_modules/vendor or sibling). Empty/template placeholders stay unfilled. Idempotent; does not overwrite existing files without confirmation. Does not run an evidence scan. Does not copy company skills into the client.
---

# init

Scaffold the **IDE spread structure** into a **target git repository**. Copy the gist-shaped templates (`AGENTS.md`, `.agents/README.md` Agent Guide, docs / features / proposals slots). Leave placeholders **unfilled**. Ensure a neat-os consume path so agents can resolve launch skills.

This is **not** an evidence scan. Do **not** write Docker/Make/stack prose into the guide. Do **not** invent client facts. Do **not** copy company skills or templates into `.agents/skills/`.

`gather` fills that structure from **repo evidence + interview** (Agent Guide content, stack, Docker/Make, passport, ticket prefix). `learn` is not gather.

## Dual-mode consume

Two supported ways to reach neat-os knowledge. Copying skills into the client is **not** a consume path and is **not** vendoring. **Both modes share the locked resolve order below.**

| Mode | When | How it is installed |
| --- | --- | --- |
| **Installed dep** | Local / IDE / often a single clone | Node: `git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z` in `package.json`. First add: `npm install`. Already locked: `npm update @shedcollective/neat-os`. Lands in **`node_modules/@shedcollective/neat-os`**. Composer VCS → **`vendor/shedcollective/neat-os`** (PHP metadata only). That install is **vendoring**. Recipes: `docs/consume.md`. |
| **Sibling / live tree** | Cloud Agents (multi-repo: client + neat-os). Proven. | Checkout beside the client. Optional `NEAT_OS_ROOT` (absolute) or `npm install ../neat-os` (`file:`) so `require('@shedcollective/neat-os')` works. |

Do not invent a Packages registry or `NODE_AUTH_TOKEN`. Install from git (`file:` sibling or `github:shedcollective/neat-os#tag`) only.

## Locate neat-os (locked resolve order)

When finding the neat-os root or running launch skills (`init`, later `gather` / `learn`), resolve in this order and **stop at the first hit**. Use `skills/init/scripts/resolve-consume.sh` (or `require('@shedcollective/neat-os').resolveConsume()`). Do **not** invent a different order.

1. **`NEAT_OS_ROOT`** — env var, **absolute** path to a tree that contains `skills/` and `templates/`. If unset or invalid, continue.
2. **Node install** — `node_modules/@shedcollective/neat-os` (walk up from cwd / project root), or `require.resolve('@shedcollective/neat-os/package.json')` from the project root.
3. **Composer install** — `vendor/shedcollective/neat-os` (walk up). PHP metadata only; does **not** ship `skills/` / `templates/`.
4. **Sibling checkout** — `../neat-os` (Cloud Agent multi-repo / local OS development).

`SHED_OS_ROOT`, `node_modules/@shedcollective/shed-os`, `vendor/shedcollective/shed-os`, and `../shed-os` still resolve when the neat-os name is absent. Each prints a deprecation warning. The migration is in `docs/consume.md`.

If the target directory **itself** is a neat-os tree (`skills/` + `templates/`), that is a `checkout` (this repo). It is a last-resort hit after 1–4.

**Do not** search the public web for “neat-os init”, “how to install neat-os”, or similar. **Do not** invent install steps from search results. If none of 1–4 work, tell the human how to install (git pin → `node_modules/`, or a sibling checkout) and stop. No web rabbit hole. No Packages registry.

Prefer the **installed package** (step 2) over a sibling clone that happens to sit next door. Looking at `../neat-os` first is the wrong order for Local/IDE dependency consume.

## When to use

- A repo has no `AGENTS.md` / `.agents/` yet, or slots are missing.
- A human asked to retrofit or initialise neat-os in a project.
- Bringing a repo into the OS by copying the gist IDE spread **structure**. Filling that spread is `gather`.

## Steps

1. **Confirm git root.** Resolve the target with `git rev-parse --show-toplevel`. If that fails, stop and ask for a path. Do not initialise a non-git directory unless the human explicitly asks to `git init` first.

2. **Locate neat-os** with the locked order above. Stop at the first hit. Typical paths to the scripts once you have a root:

   ```bash
   # After step 2 (IDE / git pin) — try this before ../neat-os
   bash node_modules/@shedcollective/neat-os/skills/init/scripts/resolve-consume.sh
   # or: node -e "console.log(require('@shedcollective/neat-os').skillsDir)"

   # After step 1 (env)
   bash "$NEAT_OS_ROOT/skills/init/scripts/resolve-consume.sh"

   # After step 4 (Cloud Agent sibling) — only if 1–3 missed
   bash ../neat-os/skills/init/scripts/resolve-consume.sh
   ```

   Or pass the target: `resolve-consume.sh /path/to/project`.

3. **Ensure consume path.** If mode is `missing`, add or verify a real consume path — do not copy skills, do not web-search:
   - Node project, Local/IDE: write `git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z` into `package.json`. First add: `npm install`. Already locked: `npm update @shedcollective/neat-os`. See `docs/consume.md`.
   - Cloud / sibling present: set `NEAT_OS_ROOT` (absolute) or `npm install ../neat-os` (`file:`).
   - PHP project: add/verify Composer VCS `shedcollective/neat-os` (fills `vendor/` with metadata only). Skills still need Node `file:` / `github:` or `NEAT_OS_ROOT`.

4. **Scaffold the IDE spread** (structure only; no company skills). From the same neat-os root:

   ```bash
   bash node_modules/@shedcollective/neat-os/skills/init/scripts/copy-templates.sh
   # or: bash "$NEAT_OS_ROOT/skills/init/scripts/copy-templates.sh"
   ```

   Or pass the target: `copy-templates.sh /path/to/project`.

   Default is **no overwrite**. Existing files are skipped and listed. To replace a file, get explicit confirmation, then re-run with `--force`.

   The script copies these if missing and **stops**. It does **not** run a light scan:
   - `AGENTS.md` — canonical cross-IDE agent guide (**template placeholders OK**), including a **Platform leaves** section that points at `.agents/platforms/` (leaves themselves are created later when beneficial) and a **Stack packs** section that stays "None yet" until gather
   - `.agents/README.md` — operational **Agent Guide** template (gist shape: Critical Docker / container rules, Makefile, overview, architecture, directory layout, generated paths, how to start). Empty/template slots stay empty. **If a hand-written custom guide already exists, skip it** unless `--force`.
   - `.agents/docs/` — living reference docs
   - `.agents/features/TEMPLATE.md` — per-ticket plan template
   - `.agents/dependencies/pins.md` — dependency pin table (package, version, reason). Empty until filled.
   - `.agents/platforms/` — slot for surface-specific leaf guides (`README.md` + `TEMPLATE.md` only). Do **not** invent `frontend.md` / `backend.md` here; `gather` ascertains whether a split helps and writes those leaves from evidence.
   - `.agents/project.md` — structured slots (layout, start commands, stack, CI, gather-next) — unfilled
   - `.agents/proposals/` — `learn` drafts (not org skills)
   - `README.md` — **only if missing**: a stub pointing at `AGENTS.md` / `.agents/README.md` / `.agents/project.md`

   It does **not** copy `init`, `gather`, or `learn` into the client. It does **not** copy `stacks/` into the client.

5. **Resolve skills from neat-os**, not from a client copy (same order; stop at first hit):
   - `require('@shedcollective/neat-os').skillsDir` after `file:` or `github:`
   - `$NEAT_OS_ROOT/skills`
   - `../neat-os/skills` only when 1–3 missed
   - Composer: `Neat\Os\NeatOs::knowledgeSourceHint()` — do not walk `vendor/` for `SKILL.md` files

6. **Optional IDE fan-out.** If the human wants multi-IDE pointers, create **symlinks** to `AGENTS.md` (do not duplicate content). Skip any path that already exists:

   ```bash
   ln -sf AGENTS.md CLAUDE.md
   mkdir -p .github && ln -sf ../AGENTS.md .github/copilot-instructions.md
   mkdir -p .cursor/rules && ln -sf ../../AGENTS.md .cursor/rules/agents.mdc
   mkdir -p .windsurf/rules && ln -sf ../../AGENTS.md .windsurf/rules/agents.md
   ln -sf AGENTS.md GEMINI.md
   ```

   Verify staged symlinks with `git ls-files -s | grep 120000` after add.

7. **Do not invent facts.** Report which files were written vs skipped and which consume mode `resolve-consume.sh` reported. Do not fill Docker/Make/stack/Jira from the tree. If the project already has real product knowledge, do not replace it.

8. **Stop.** Next: `gather` fills the Agent Guide and `.agents/project.md` from repo evidence plus interview (including the ticket prefix ask). `gather` also ascertains whether **platform leaf** docs under `.agents/platforms/` (frontend / backend / app vs web / …) would help and, when beneficial, writes those leaves and links them clearly from `AGENTS.md`. `gather` fills **Stack packs** when the tree's frameworks match a `stacks/<name>/` pack in neat-os; it does not copy the pack. The evidence scan may be non-interactive; gather is **not complete** until the interview (especially Client and Product). Init is not a substitute for gather.
