# Contributing

How to change neat-os. People merge. Agents open the pull request and keep CI green.

## Branching

The rules are locked in [conventions/git.md](../conventions/git.md). In short:

- Branch from `develop` and open pull requests into `develop` only.
- For a large change, use a stack: a feature branch holds the whole change, each step branches from the previous step and targets it, and the title is `[GH-n] (<step>/<total>) <type>: <description>`.
- Merge with merge commits, not squash ([ADR-0005](decisions/0005-merge-commits-not-squash.md)). `learn` reads merge history, and a squash erases it.
- Write commit messages as Conventional Commits (`feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`) with the ticket key. Commit shape (one concern, what and why, documentation first, then an order a reviewer can follow) is locked in [conventions/git.md](../conventions/git.md) ([ADR-0014](decisions/0014-commit-shape-for-review.md)).
- A release is `develop` merged to `main` and tagged. Agents do not tag `main`. See [release.md](release.md).

## Tickets

Work on neat-os is tracked in GitHub Issues in this repository, keyed `GH-<n>` ([conventions/tickets.md](../conventions/tickets.md), [ADR-0007](decisions/0007-github-issues-for-os-repos.md)). Product repositories use Jira. Do not open a Jira epic for neat-os work unless the project management team asks for one.

## The required check

```bash
bash scripts/check
```

`npm test` runs the same command. It runs four scripts in order: structure, policy, the neutral reference, then smoke. The same command runs locally, in CI, and for agents. Do not weaken an assertion to make a documentation edit pass. It needs Node 22 and bash, and no npm dependencies.

## Adding a file

Decide which kind of mechanism it is before you create it. The six kinds are defined in [schema/README.md](../schema/README.md). If a file is none of the six, it probably should not exist.

| Kind | When to add one |
| --- | --- |
| Principle | One judgement rule that changed a real decision in shipped work and cannot be checked by software. Create `principles/<slug>.md` with the sections *Applies when*, *The decision it changes*, and *Source*, and add it under a goal in `principles/README.md`. Keep the set small, and delete a principle that stops changing behaviour ([ADR-0018](decisions/0018-no-numeric-principle-cap.md)). Candidates usually arrive as `learn` proposals, and a person elevates them. |
| Convention | A fact every Shed repository shares, such as git-flow or which ticket system to use. Create `conventions/<topic>.md` and list it in `conventions/README.md`. Playbooks read it, and `gather` must not ask about it. |
| Playbook | An ordered sequence whose failure mode is a skipped step. Launch playbooks are `init`, `gather`, and `learn`. On-demand playbooks also live under `skills/<name>/SKILL.md` (today: [`pin-majors-with-reasons`](../skills/pin-majors-with-reasons/SKILL.md), [`assurance`](../skills/assurance/SKILL.md), [`cloud-agent-environment`](../skills/cloud-agent-environment/SKILL.md)). The frontmatter has `name` and `description`; the body has *When to use*, *Steps*, and *Stop*. |
| Skill | A capability a playbook step invokes. Same `SKILL.md` shape. Keep it short. |
| Script | Deterministic code: the same input gives the same output. It has `--help`, exits non-zero on failure, and prompts only when a terminal is attached. Prefer a script to prose whenever software can do the job ([encode-lessons-in-structure](../principles/encode-lessons-in-structure.md)). Scripts live in `skills/*/scripts/` or `scripts/`. |
| Agent | A subagent with its own context. Do not add an `agents/` folder until there is a demonstrated need. |

Two things are deliberately not on that list. Project knowledge (a product repository's `AGENTS.md` and `.agents/`) is filled by `gather` and belongs to that repository. Decisions belong in `docs/decisions/` as architecture decision records. Do not edit an accepted record except to change its Status. To reverse a decision, write a new record that links back.

State a rule once and have other files point at it by path. When in doubt, delete.

Stack packs are playbook-shaped files under [`stacks/<name>/`](../stacks/). They are company stack guidance, read from the resolved tree, not a seventh mechanism ([ADR-0013](decisions/0013-stack-packs-in-shed-os.md)).

## Writing

Every page a person reads follows [conventions/writing.md](../conventions/writing.md): write for a developer who has only the repository, one page does one job, plain words, one name per thing. The root [README.md](../README.md) is the entry point and pages under `docs/` go deeper. Install recipes appear only in [consume.md](consume.md). No page links to notes kept outside the repository ([ADR-0008](decisions/0008-repo-is-source-of-truth.md)).

## Out of bounds

- Do not create `neat-os-platform-*` or `neat-os-tool-*` repositories from this one. Stack guidance lives under `stacks/`.
- `learn` proposes. It never pushes a skill to this repository or to a shared skill store.
- Do not turn `publish-npm.yml` on ([ADR-0017](decisions/0017-consume-via-github-packages.md)). The licence is MIT, and publishing stays a later step. Do not add a registry auth line for agents.
- Do not invent facts about a client or a project.
