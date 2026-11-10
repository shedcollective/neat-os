# Writing

**Locked:** write for a developer on their first day at Shed who has this repository open and nothing else.

This applies to every file a person reads in a Shed repository: READMEs, `docs/`, principles, conventions, the `AGENTS.md` and `.agents/` files that `init` copies into product repos, pull request descriptions, and commit messages. Agent-facing files (`SKILL.md`, `AGENTS.md`) may be terser and may bold a hard rule, because the reader is scanning for constraints. The sentence rules still apply to them.

## Write for a public reader

This is the first layer for everything this repository commits or publishes: code comments, commit messages, docs, and pull request titles and bodies. Generic-pattern checks and review are the backstops ([neutral-reference.md](neutral-reference.md)).

Write for a public reader who has never met the client. Describe what changed and why in generic terms, such as "a client's checkout" or "the reviewer asked for". Do not write who did it, or where it happened.

Point to context by ticket key. The detail lives in the ticket, not in the commit.

Do not paste chat, meeting notes, or emails. Summarise the decision instead.

## Rules

1. **Assume the reader has only the repository.** Every reference must be something the reader can open from the file: a path in the repo, a GitHub issue or pull request link, or a public URL. Do not cite meetings, chat threads, private notes, or the internal position of a piece of work ("step 4 of the batch"). State the fact instead and link the issue if the history matters.
2. **One page, one job.** Decide before writing whether a page gives steps to a goal (how-to), facts to look up (reference), or reasons (explanation). Do not mix them on one page. Link where they meet. The root `README.md` is a map with quick starts. Each page under `docs/` does one job. `docs/decisions/` holds the reasons already recorded. New records are paused until v1 ([docs/decisions/README.md](../docs/decisions/README.md)).
3. **Say it once, then link.** A recipe, rule, or fact lives in one file. Every other file points at it by path and does not restate it. If two files disagree, the one named as the source of truth wins and the other is a defect.
4. **Use the words a developer would say out loud.** Prefer "use" to `utilise`, "help" to `facilitate`, "if" to `in the event that`. Do not write `simply` or `easy` in a procedure. Do not coin a metaphor for something that has a plain name. A named term is fine when the page says what it means the first time.
5. **Write whole sentences.** Keep the articles and the verbs. In running text, spell out arrows and symbols: write "then", "is not", "or", not `→`, `≠`, `/`. Symbols are fine inside code spans, commands, and a table cell that lists an order. Do not use em dashes in prose. End the sentence, or use a comma.
6. **One name per thing.** Pick one term and repeat it. The table below lists the terms this repository uses. Add a row rather than inventing a synonym.
7. **Instructions are commands, condition first.** "To pin a release, set the tag in `package.json`." Numbered lists for sequences, bullets for everything else. Introduce a list with a complete sentence.
8. **Headings carry the point and use sentence case.** "Tag only what installs", not "Tagging".
9. **Bold the one thing the reader must not miss.** A paragraph with three bold phrases has none. Do not bold every "not".
10. **Pull request descriptions and commit messages are writing too.** Commit messages follow [git.md](git.md). A pull request body follows [Pull request bodies](#pull-request-bodies). Link logs and test output instead of pasting them.
11. **Do not hard-wrap a paragraph.** Each paragraph and each list item is one line. The editor or GitHub soft-wraps it. Put a line break between paragraphs, headings, and list items, not in the middle of a sentence.

## Pull request bodies

A pull request body is the note a reviewer reads before they decide. It states **the practical change and why that change is the one to accept**. It does not narrate the diff file by file, and it does not open with a preamble that repeats the title.

Write the opening in plain sentences. Say what a person can do, or rely on, that they could not before, and why this is the change. Stop when the reviewer can accept or reject it. Do not repeat that reason later in the body.

When a concrete before and after shows the change more clearly than another sentence, include one. Leave it out when the opening is already clear.

When the change is a decision or a trade-off, name the decision and name the path the reviewer should open. When the change is straightforward, do not invent a decision.

State what was verified and what was not. Tie the evidence to the command, the artefact, or the commit that was checked. A compiler finishing, or a type check passing, does not show that two behaviours are the same.

Keep the notes a later reader may need in one collapsed reference. Use a `details` block with a `summary` when the host renders one. Include a line only when it has something to say. Those lines are the rules this change touches, the rationale, who is affected, references, and work that was deferred. Name a rule by the identifier this repository already uses: a principle slug, a convention path, an ADR id, or a policy id. The rationale is the convention or principle that forced the shape, not a second copy of the opening. The summary names the reference. It must not hide a risk, and it must not contradict the text inside. A risk the reviewer must weigh belongs in the opening.

One pull request describes one coherent change. Short sentences do not turn unrelated decisions into one change. Split them.

The title and the ticket key stay in [git.md](git.md). A pull request into `develop` still includes the closing keyword from [tickets.md](tickets.md#where-the-key-goes). A stacked step still starts with the line [git.md](git.md#stacked-prs) requires. Those lines stay in the body. They are not a second briefing. The neutrality checkbox on the pull request template stays. It is the review step in [neutral-reference.md](neutral-reference.md).

This shape serves the aim in [PURPOSE.md](../PURPOSE.md) that a person can trust the work without rereading every line. The shape is review. It is not a check in `scripts/`. [ADR-0025](../docs/decisions/0025-pull-request-body-for-the-reviewer.md).

### Example of a pull request body

The example is generic. The page path is invented. It is not a change in this repository.

```text
The order page said "Submit", and a failed save left a blank page. It now says "Place order", and a failed save shows "Try again" and keeps what the customer typed. A customer can correct the order without starting again.

Before: a failed save replaced the form with a blank page.
After: the form stays, and the page shows "Try again".

The message stays in the existing page template. A new component would be a second place to change one string. Read templates/order.html.

Verified: the checkout flow was clicked through in a local browser at the pull request head, including a failed save. The payment provider was not called.

<details>
<summary>Reference</summary>

Consumers: the storefront page template only.

Deferred: the message shown when the payment provider rejects a card.

</details>
```

## Terms

| Term | Meaning | Do not write |
| --- | --- | --- |
| neat-os | This repository and the package it publishes | "the OS core", "the skeleton" |
| playbook | A `SKILL.md` under `skills/` with When to use, Steps, and Stop. Coding playbooks include `init`, `gather`, `learn`, `ticket`, `assurance`, `pin-majors-with-reasons`, and `release`. Agency operations playbooks are listed in [docs/agency-ops.md](../docs/agency-ops.md). | "launch skill" |
| ticket | One Jira Task in a product repo, or one GitHub Issue in an OS repo | "task", "issue" or "story" as a second name for the same thing |
| Agent Guide | The `.agents/README.md` file in a product repo | "the gist", "IDE spread" |
| project slots | The files under `.agents/` that `init` creates and `gather` fills | "IDE spread slots" |
| consume | How a product repo installs neat-os so an agent can find it | "vendoring" as a synonym (vendoring is one way to consume) |
| resolve order | The fixed order an agent searches for neat-os | "lookup", "discovery" |
| Cloud Agent | A Cursor agent that runs on a Cursor-hosted machine | "remote agent", "cloud run" |
| Environment | A Cursor Cloud Agent Environment: the set of repos cloned together for a run | "env" in prose |
| Cursor IDE | The desktop editor | "the app" |
| product repo | A repository that consumes neat-os, usually built for a client | "client repo" as a second name for the same thing |
| stack pack | Company stack guidance under `stacks/<name>/` in neat-os (for example Nails). `gather` points a product repo at it. It is never copied | "platform repo", "neat-os-platform-*" |
| platform leaf | A guide for one surface of a product repo, under `.agents/platforms/` (for example `frontend.md`) | "platform guide", "stack pack" |
| principle | One judgement rule under `principles/` | "leaf" for a principle |
| OS repo | neat-os or a future `neat-os-tool-*` repository, as opposed to a product repo | "core repo" |
| source of truth | Spell it out | "SoT" outside agent-facing files |
| wrapper | The short file in a person's agent that names one playbook and fills the settings in [routine-settings.md](routine-settings.md) | "bot skill" as a second name for the same file |
| bot passport | The one-screen record of a team bot's job, refusals, human gates, sources, skills, routines, pin, and owner | "profile" |
| operations lead | The role that owns the private operations record, including the bids register | "chief of staff" as a second name, a person's name, a bot name |
| design agent | The team agent whose job is to turn a brief into 2 to 3 Figma options a named lock owner picks | a bot name |
| UX agent | The team agent whose job is UX audit, research synthesis, and information architecture with clickable wireframes | a bot name |
| lock owner | The person named on the brief who picks one of the 2 to 3 options | a person's name |
| client lead | The person who may send work to that client, and who may approve edits to that client's design system | a person's name |

The roles in this repository are maintainer, PR author, reviewer, director, asker, operations lead, lock owner, client lead, code agent, assurance agent, design agent, and UX agent. When a sentence is about a role, name the role.

## What the check enforces

`scripts/check-policy.js` fails the reader-facing pages (`README.md`, `docs/*.md`, `packages/*/README.md`, `conventions/*.md`, `principles/*.md`, `stacks/**/*.md`, `schema/README.md`) on the part of this convention that software can see: em dashes, `≠`, `in order to`, `utilise`, `leverage`, `simply`, and references to a ticket sub-step such as `GH-42 step 4`. `scripts/check-structure.js` rejects Notion URLs anywhere ([ADR-0008](../docs/decisions/0008-repo-is-source-of-truth.md)). Everything else in this page is review.

## Source

[ADR-0009](../docs/decisions/0009-writing-convention.md). The rules are a short form of four public standards: [Diátaxis](https://diataxis.fr) for page types, the [Google developer documentation style guide](https://developers.google.com/style) for sentences, [ASD-STE100](https://www.asd-ste100.org) for one thought per sentence, and *The Global English Style Guide* (SAS Press, 2008) for sentences that read one way. The layering, and the catalogue of machine-written tells that rule 4 and rule 5 cut, follow the `technical-writing` and `unslop` skills in [pstack](https://github.com/cursor/plugins/tree/main/pstack), a public plugin for Cursor. This OS keeps them as a convention, not a skill: they are a locked default that every page follows, not a step an agent invokes.
