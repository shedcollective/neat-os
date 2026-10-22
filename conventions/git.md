# Git workflow

**Locked:** this OS uses **git-flow** in every repository. Not trunk-based, not “whatever this client prefers.”

## Shape

- Integration branch: `develop` (day-to-day PRs land here)
- Production branch: `main`
- Feature branches from `develop`, merge back to `develop`
- Release branches from `develop` → `main` (and back to `develop`)
- Hotfixes from `main`

Agents branch from `develop` and open PRs **into `develop` only**. Humans merge. When the ticket is a GitHub Issue, the pull request that targets `develop` includes `Closes #<n>` in its body ([tickets.md](tickets.md)).

### PR titles

**Locked.** Every pull request title, stacked or not:

```
[<KEY>] <type>: <description>
```

Stacked steps keep the same shape with an infix after the key:

```
[<KEY>] (<step>/<total>) <type>: <description-of-step>
```

- `<KEY>` is the ticket key in capitals (`GH-42`, `ACME-123`; see [tickets.md](tickets.md))
- `<type>` is lowercase Conventional Commits: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, or `style`
- The description is sentence case
- Do not put the ticket in parentheses at the end of the title

Commits stay Conventional Commits (`feat|fix|chore|refactor|docs|test|style`), with the ticket key in the subject or footer per [tickets.md](tickets.md). Do not title a commit with the pull request shape.

### Stacked PRs

**Locked.** One feature split into steps is a **stack**: a feature branch that holds the stack, and one step branch per slice.

**Step 0 is the feature branch.** Branched from `develop`, opened with a single empty commit (`git commit --allow-empty`) as a **Draft** PR into `develop`. It is the only PR in the stack that targets `develop`, and it is merged last, once every step is in.

**Steps.** Step 1 branches from the feature branch; step *n* from step *n−1*. Each step PR targets the branch beneath it. Steps merge bottom-up into the feature branch (delete the step branch on merge so GitHub retargets the next step). Each step carries its own Conventional Commits type.

`<step>/<total>` is the position in the stack and the stack size. If a step is split, retitle every step in the stack the same day.

Branch names are the lowercase slug form (no spaces, brackets or `/` inside the name): feature `feature/<key>-<slug>`, steps `feature/<key>-<step>-<slug>`. The first line of a step PR body reads `Step <step>/<total> · base: <branch> · part of #<issue>`.

Example, one feature in four steps. `GH-42` is the placeholder key from [tickets.md](tickets.md), not an issue in this repository:

```
[GH-42] feat: checkout                                 feature/gh-42-checkout  → develop (draft)
[GH-42] (1/4) feat: add the basket                     feature/gh-42-1-basket  → feature/gh-42-checkout
[GH-42] (2/4) feat: add the address step               feature/gh-42-2-address → feature/gh-42-1-basket
[GH-42] (3/4) docs: describe checkout in the guide     feature/gh-42-3-docs    → feature/gh-42-2-address
[GH-42] (4/4) chore: prepare the release               feature/gh-42-4-release → feature/gh-42-3-docs
```

Humans merge every PR in the stack, steps included; review happens per step and the feature-branch merge is the final gate. Nothing in a stack targets `main`.

**A pending merge never blocks the next step.** The agent branches step *n+1* from the head of step *n* as soon as step *n* is merge-ready (PR open, CI green, evidence posted) and continues. When step *n* merges, the agent rebases the open steps above it. When `develop` moves, it merges `develop` into the feature branch and rebases the steps. Keeping a stack merge-ready is agent work; pressing merge is not.

A single, unstacked PR uses plain Conventional Commits with the key: `feat(gather): … (GH-42)`.

### Commits

**Locked.** Each commit is one concern, so a reviewer can read it on its own. The message says what changed and why. A pull request may hold several commits. Do not put the whole piece of work into one commit because those commits land together. Do not split so thinly that an intermediate commit does not stand on its own.

When a piece of work is recorded as several commits, order them so a reviewer can follow the change from the first commit to the last. When the work includes documentation, that documentation is the first commit. After that, a commit comes before the commits that depend on it.

Subjects stay Conventional Commits (`feat|fix|chore|refactor|docs|test|style`), with the ticket key per [tickets.md](tickets.md).

Who the author is, and the ban on a co-author trailer, is [attribution.md](attribution.md).

Stacked pull requests split review. They do not put each commit in its own pull request.

Why this shape is locked: [ADR-0014](../docs/decisions/0014-commit-shape-for-review.md).

## Project vs company

| Fact | Where |
| --- | --- |
| Workflow is git-flow | Here (do not ask in `gather`) |
| This repo’s integration branch is actually named `develop` | Project `.agents/`. Confirm only if it might differ |
| Ticket prefix (Jira key, or `GH` for OS repos) | Project `.agents/` ([tickets.md](tickets.md) says which system) |
| Feature branch / plan-file naming for *this* ticket scheme | Project `AGENTS.md` (template already has the pattern) |

Template `AGENTS.md` ships with git-flow already filled. `gather` asks or marks the ticket prefix (interactive / `--ticket-prefix` / `NEAT_OS_TICKET_PREFIX` / `TODO / ask`; OS repos get `GH` from [tickets.md](tickets.md) without asking). `SHED_OS_TICKET_PREFIX` is a deprecated fallback. `gather` confirms and deepens project slots; it does not offer a workflow menu.

## This repo (`shedcollective/neat-os`)

The first drop on `main` was the alpha skeleton (`0.0.0`), under the previous product name. From 0.4.0 this tree is neat-os. Releases are tagged on `shedcollective/neat-os`. This repo follows git-flow:

- Day-to-day PRs → `develop` (GitHub default branch)
- Releases → `main` (tag + GitHub Release). How to ship: [docs/release.md](../docs/release.md)
- Prefer **merge commits**, not squash. A squash deletes the merge history that `learn` reads
