# Mechanism taxonomy

neat-os is built from six kinds of thing. Before adding a file, decide which kind it is. If it is none of them, it probably should not exist ("no file should exist because it sounds advanced").

| Mechanism | What it is | Use it when | Lives in | File shape |
| --- | --- | --- | --- | --- |
| **Principle** | One judgement rule an agent applies while deciding. Never invoked; cited by naming the decision it changed. | The rule should guide almost every relevant task and cannot be checked by software. | `principles/` | `<slug>.md`: rule in one line, then the labelled paragraphs **Applies when**, **The decision it changes.**, **Source.** Indexed in `principles/README.md` under a goal. |
| **Convention** | A locked fact about how Shed works. Not a judgement; not re-asked per project. | Every Shed repo does it the same way (git-flow, ticket systems). | `conventions/` | `<topic>.md`, listed in `conventions/README.md`. Skills read it; templates inherit it; `gather` does not ask it. |
| **Playbook** | An ordered list of steps for one task type, with a completion criterion. Steps are copied into the agent's todo list; a skipped step stays in the list with a `skip:` reason. | There is a reliable multi-step sequence and the failure mode is dropping a step. | `skills/<name>/SKILL.md` (Agent Skills frontmatter is the portable discovery unit; the *content* is a playbook) | Frontmatter `name`, `description`; sections *When to use*, *Steps*, *Stop*. Delegates to scripts and skills by path. |
| **Skill** | An invokable capability an agent runs on demand, usually from a playbook step. | A discrete job with inputs and outputs, reusable across playbooks. | `skills/<name>/SKILL.md` (+ `scripts/`) | Same frontmatter. Short; tells the agent what to run and what to report. |
| **Script** | Deterministic code. Same input, same output. The source of truth for "green". | Software can do or check the thing. Prefer this over prose every time it is possible. | `skills/*/scripts/`, `scripts/` | Executable with `--help`; exits non-zero on failure; no interactive prompts unless a TTY is present. |
| **Agent** | A subagent definition with separate context, used for independent challenge or verification. | Separate context would improve challenge (reviewer, QA) rather than add ceremony. | `agents/` (not yet present; add only with a demonstrated need) | One file per role: job, boundary, what it must not do. |

Two things that are *not* mechanisms: **project knowledge** (lives in the product repo's `AGENTS.md` and `.agents/`, filled by `gather`) and **decisions** (live in [`docs/decisions/`](../docs/decisions/README.md) as ADRs and explain why a mechanism exists).

## Choosing by what the thing is for

If you know what a piece of knowledge is for but not which kind of file it should be, start here:

- A constraint that should hold on every task becomes a principle if it needs judgement, or a convention if it is a fact.
- Context about one project is not a neat-os mechanism at all. It belongs in that product repo's `AGENTS.md` and `.agents/`.
- A job that repeats becomes a playbook if it is a sequence, or a skill if it is a single capability.
- A check that needs a separate point of view becomes an agent.
- Anything software can prevent becomes a script: a test, a linter, a hook, or a CI check.
- Knowledge or an action that lives outside the repository becomes a script or a tool integration, and only with a point where a person approves it.

## How the tree is typed

Type is read from location and shape, not from a list kept here. `scripts/check-structure.js` derives the skill set from `skills/*/` and asserts each frontmatter `name` equals its directory, so adding a mechanism never edits this page.

- Every `skills/<name>/SKILL.md` is a **playbook** or a **skill**; the `SKILL.md` frontmatter is the discovery unit for both. It is a playbook if its body is an ordered step list with a *Stop* criterion, a skill if it is a single capability. A `scripts/` directory beside it holds the **scripts** it delegates to; a playbook with no `scripts/` is deterministic through the convention it applies and the tool the runner already has (a ticket system, a package manager).
- The **launch playbooks** are the ones a product repo runs to adopt neat-os; they are named in [ADR-0002](../docs/decisions/0002-launch-skill-split.md) and asserted present by `check-structure`. Every other entry under `skills/` is on-demand.
- Every `conventions/<topic>.md` listed in `conventions/README.md` is a **convention**.
- Every `principles/<slug>.md` listed in `principles/README.md` under a goal is a **principle**. Kaizen, Determinism and Parallelism are the three *goals* the principles serve, not principles themselves.
- `scripts/check*` and anything under `skills/*/scripts/` are **scripts**.
- `agents/` does not exist; there are no **agents** yet.
- Every `stacks/<name>/*.md` other than `README.md` is a **stack pack** playbook. Indexed in `stacks/<name>/README.md`. `gather` points a product repo at the pack when the tree matches. Not a seventh mechanism; see [ADR-0013](../docs/decisions/0013-stack-packs-in-shed-os.md).

## Authoring rules (all mechanisms)

- State a rule once. Other files point at it by path; they do not restate it.
- Keep only prose that changes a decision. Tell the agent what to do; explain only when the rule is confusing without a reason.
- When a rule can be a script, make it a script and delete the prose (see [encode-lessons-in-structure](../principles/encode-lessons-in-structure.md)).
- When in doubt, delete.

## Still to define

- Skill metadata beyond Agent Skills frontmatter.
- The elevation record from `.agents/proposals/` to a published principle or playbook (today: a human PR, see [propose-never-promote](../principles/propose-never-promote.md)).
