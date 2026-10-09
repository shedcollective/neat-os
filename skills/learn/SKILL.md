---
name: learn
description: Audit the last 50 commits and last 20 merge commits, summarise patterns, and propose skill elevations only. Not gather — does not fill project facts or run an evidence scan. Stops for a human PR — never auto-promotes or pushes to org skill repos.
---

# learn

Read recent history, describe patterns, and **propose** skill candidates. Elevation into neat-os (including `stacks/<name>/`) or a `neat-os-tool-*` leaf is a **human PR gate**.

This is **not** `gather`. Do not fill the Agent Guide, evidence passport, or `.agents/project.md` from the tree. Do not auto-elevate.

## When to use

- After a stretch of work, the human wants "what should we turn into a skill?"
- A mature repo has patterns that might belong in company knowledge.
- Someone asks to promote a project habit into neat-os.

## Hard rules

- **Propose only.** Do not merge, push, or publish skills to `shedcollective/neat-os`, `neat-os-tool-*`, or any other org skill store. Do not auto-elevate. Do not create a `neat-os-platform-*` repository.
- **Not gather.** Do not run `light-scan.sh` or write Docker/Make/stack prose into project slots.
- Launch skills live in neat-os. Locate the tree the same way `init` does (`resolve-consume.sh` / `require('@shedcollective/neat-os').resolveConsume()`): `NEAT_OS_ROOT`, then `node_modules/@shedcollective/neat-os`, then `vendor/shedcollective/neat-os`, then sibling `../neat-os`. `SHED_OS_ROOT` and the shed-os package paths still resolve and are deprecated (`docs/consume.md`). **Do not** search the public web for neat-os. Do not copy launch skills into this repo’s `.agents/skills/`. Drafts go in `.agents/proposals/` only.
- Do not invent patterns the git history (and readable files) do not support.
- **Company drafts are project-agnostic.** A draft destined for neat-os or a stack pack is company-wide guidance. Do not name a client, a product repository, a local path, or a ticket from the repo under audit. Do not include evidence tables of those files. Project-specific facts belong in this repo's Agent Guide, not in the draft.

## Steps

1. **Confirm git root.** `git rev-parse --show-toplevel`.

2. **Choose windows.** Defaults: **50** commits and **20** merge commits. Honour `N=` / `--commits` and `M=` / `--merges` from the human. If the repo has fewer, use all of them.

3. **Audit.** From the target root.

   Recent commits (texture: messages, paths, commit types):

   ```bash
   git log -n "${N:-50}" --pretty=format:'%h %ad %s' --date=short
   git log -n "${N:-50}" --name-only --pretty=format:'COMMIT %h %s'
   ```

   Recent **merge** commits (landed work under git-flow). Prefer first-parent on the integration branch so feature-branch back-merges of `develop` do not dominate:

   ```bash
   INTEGRATION="$(git rev-parse --verify develop 2>/dev/null && echo develop || echo HEAD)"
   git log --first-parent "$INTEGRATION" --merges -n "${M:-20}" --pretty=format:'%h %ad %s' --date=short
   git log --first-parent "$INTEGRATION" --merges -n "${M:-20}" --name-only --pretty=format:'MERGE %h %s'
   ```

   If that list is empty, say so. Do not fake merges. Fall back to the 50-commit window only, and note that squash-merge (or a shallow clone) may have removed the merge signal.

   Optionally skim prompts or agent notes if they exist in-repo (for example `.agents/features/*`). Do not scrape uncommitted IDE chat.

4. **Summarise patterns.** Use **merges** as the primary "what landed" signal and **commits** as supporting detail. Group what you actually saw: commit types, paths that churn, repeated fixes, stack rituals, gaps vs neat-os `principles/` (Kaizen, Determinism, Parallelism). Separate:
   - **Project-specific** (belongs in this repo's `.agents/`). Write it there, or say so. Do not propose it for neat-os.
   - **Portable** (candidate for neat-os principles, conventions, playbooks, or a `stacks/<name>/` pack). Describe the rule in company language. The chat may say it showed up in this repo; the draft file must not.

5. **Propose skill candidates.** For each portable candidate, write a short draft under `.agents/proposals/` (create the directory if needed). Suggested filename: `YYYY-MM-DD-short-name.md`.

   Each draft must include:
   - Proposed `name` and when to use it
   - What it locks (the rule, in company-wide wording)
   - Suggested location: `principles/` / `conventions/` / `skills/` vs `stacks/<name>/`
   - Why it should **not** be auto-merged
   - A stub YAML frontmatter + outline the human can edit

   Do **not** include: client names, product-repo names, paths under another repository, ticket keys from the audit, commit SHAs, or an evidence table. Those do not travel. If the only way to state the rule is to name this project, it is not portable; put it in `.agents/` here instead.

6. **Stop for a human.** Print a short list of proposals and the file paths. Tell the human to open a PR themselves if they want elevation into neat-os. Do **not** create that PR against org skill repos unless the human explicitly asks **in this conversation** to open a PR **in the current workspace** (this repo). Even then, do not push to other repositories. That PR follows [conventions/tickets.md](../../conventions/tickets.md): its body includes `Closes #<n>` so GitHub links it in the issue's Development section and closes the issue when it merges.

7. If nothing is worth promoting, say so. An empty proposal with "no candidates" is valid.
