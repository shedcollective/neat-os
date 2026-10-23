# Principles

Three goals steer neat-os. Under each sit short principles: one judgement rule each, applied while deciding, never invoked as a command. When a principle shapes a decision, name it and the choice it changed; a citation with no decision behind it does not count.

Read this index at the start of any multi-step task. Open a principle when its *Applies when* matches.

## Kaizen: improve the system from shipped work, in small steps

| Principle | Rule |
| --- | --- |
| [encode-lessons-in-structure](encode-lessons-in-structure.md) | When a failure repeats, add a script, test, template slot or convention, not more prose. |
| [smallest-complete-change](smallest-complete-change.md) | Prefer the smallest change that fully solves the problem; no speculative abstraction, no unrelated refactor. |
| [propose-never-promote](propose-never-promote.md) | Agents may draft skill or principle candidates; only a human PR elevates them into company knowledge. |
| [keep-the-guide-true](keep-the-guide-true.md) | A change that invalidates the Agent Guide updates the guide in the same change; do not park facts in host or IDE memory. |

## Determinism: the same inputs give tested, trusted results

| Principle | Rule |
| --- | --- |
| [evidence-before-done](evidence-before-done.md) | "Done" is a claim backed by evidence from the real artefact; name what was not verified. |
| [never-invent-facts](never-invent-facts.md) | Client, stack and environment facts come from the tree or a human; unknowns are marked visibly, never guessed. |
| [inspect-before-inventing](inspect-before-inventing.md) | Read the existing architecture and comparable code before creating a new pattern. |
| [red-is-a-stop](red-is-a-stop.md) | A red required check on the integration branch is the first task; nothing new is branched, stacked or merged onto red. |
| [use-the-declared-runtime](use-the-declared-runtime.md) | If the Agent Guide names a runtime, run the toolchain through it; host binaries are not a substitute. |
| [enqueue-external-side-effects](enqueue-external-side-effects.md) | When a repo already queues writes to an external system, new writes use that queue. |
| [script-checks-formats](script-checks-formats.md) | Commit ticket keys and pull request titles are checked by a script; the agent runs it and is not the authority on the format. |

## Parallelism: independent workers, including Cloud Agents

| Principle | Rule |
| --- | --- |
| [keep-human-gates](keep-human-gates.md) | Humans merge, release and approve destructive actions; automate a gate only once it is chore rather than value. |
| [surface-conflicts](surface-conflicts.md) | When instructions conflict or scope changes materially, stop and surface it; do not guess and do not block silently. |

## Adding a principle

Candidates arrive through `learn` proposals or a PR. A principle earns its place only if it changed a real decision in shipped work and cannot be a script. Keep the set small; delete principles that stop changing behaviour. Format is in [schema/README.md](../schema/README.md).

A new proposal stays in `.agents/proposals/` after elevation, and the principle's **Source** links back to that draft. Proposals that have not been elevated stay there too. Principles elevated before this tree was named neat-os record the draft in the archive repository. [red-is-a-stop](red-is-a-stop.md) was the first principle to arrive this way.

Stack-specific rules live under [`stacks/`](../stacks/) in this repository ([ADR-0013](../docs/decisions/0013-stack-packs-in-shed-os.md)). Do not invent a `neat-os-platform-*` repository here.
