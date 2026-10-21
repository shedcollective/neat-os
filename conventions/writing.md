# Writing

**Locked:** write for a developer on their first day at Shed who has this repository open and nothing else.

This applies to every file a person reads in a Shed repository: READMEs, `docs/`, principles, conventions, the `AGENTS.md` and `.agents/` files that `init` copies into product repos, pull request descriptions, and commit messages. Agent-facing files (`SKILL.md`, `AGENTS.md`) may be terser and may bold a hard rule, because the reader is scanning for constraints. The sentence rules still apply to them.

## Rules

1. **Assume the reader has only the repository.** Every reference must be something the reader can open from the file: a path in the repo, a GitHub issue or pull request link, or a public URL. Do not cite meetings, chat threads, private notes, or the internal position of a piece of work ("step 4 of the batch"). State the fact instead and link the issue if the history matters.
2. **One page, one job.** Decide before writing whether a page gives steps to a goal (how-to), facts to look up (reference), or reasons (explanation). Do not mix them on one page. Link where they meet. The root `README.md` is a map with quick starts. Each page under `docs/` does one job. `docs/decisions/` holds the reasons.
3. **Say it once, then link.** A recipe, rule, or fact lives in one file. Every other file points at it by path and does not restate it. If two files disagree, the one named as the source of truth wins and the other is a defect.
4. **Use the words a developer would say out loud.** Prefer "use" to `utilise`, "help" to `facilitate`, "if" to `in the event that`. Do not write `simply` or `easy` in a procedure. Do not coin a metaphor for something that has a plain name. A named term is fine when the page says what it means the first time.
5. **Write whole sentences.** Keep the articles and the verbs. In running text, spell out arrows and symbols: write "then", "is not", "or", not `→`, `≠`, `/`. Symbols are fine inside code spans, commands, and a table cell that lists an order. Do not use em dashes in prose. End the sentence, or use a comma.
6. **One name per thing.** Pick one term and repeat it. The table below lists the terms this repository uses. Add a row rather than inventing a synonym.
7. **Instructions are commands, condition first.** "To pin a release, set the tag in `package.json`." Numbered lists for sequences, bullets for everything else. Introduce a list with a complete sentence.
8. **Headings carry the point and use sentence case.** "Tag only what installs", not "Tagging".
9. **Bold the one thing the reader must not miss.** A paragraph with three bold phrases has none. Do not bold every "not".
10. **Pull request descriptions and commit messages are writing too.** A pull request body is a briefing a reviewer reads in under a minute: what changed, why, how it was verified. Link logs and test output instead of pasting them. Follow [git.md](git.md) for the title and ticket key.
11. **Do not hard-wrap a paragraph.** Each paragraph and each list item is one line. The editor or GitHub soft-wraps it. Put a line break between paragraphs, headings, and list items, not in the middle of a sentence.

## Terms

| Term | Meaning | Do not write |
| --- | --- | --- |
| neat-os | This repository and the package it publishes | "the OS core", "the skeleton" |
| playbook | A `SKILL.md` under `skills/` with When to use, Steps, and Stop. The product-repo ones are `init`, `gather`, `learn`, `ticket`, `improve`, `assurance`, and `pin-majors-with-reasons`; the agency operations ones are mapped in [docs/agency-ops.md](../docs/agency-ops.md). | "launch skill" |
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

## What the check enforces

`scripts/check-policy.js` fails the reader-facing pages (`README.md`, `docs/*.md`, `packages/*/README.md`, `conventions/*.md`, `principles/*.md`, `stacks/**/*.md`, `schema/README.md`) on the part of this convention that software can see: em dashes, `≠`, `in order to`, `utilise`, `leverage`, `simply`, and references to a ticket sub-step such as `GH-42 step 4`. `scripts/check-structure.js` rejects Notion URLs anywhere ([ADR-0008](../docs/decisions/0008-repo-is-source-of-truth.md)). Everything else in this page is review.

## Source

[ADR-0009](../docs/decisions/0009-writing-convention.md). The rules are a short form of four public standards: [Diátaxis](https://diataxis.fr) for page types, the [Google developer documentation style guide](https://developers.google.com/style) for sentences, [ASD-STE100](https://www.asd-ste100.org) for one thought per sentence, and *The Global English Style Guide* (SAS Press, 2008) for sentences that read one way. The layering, and the catalogue of machine-written tells that rule 4 and rule 5 cut, follow the `technical-writing` and `unslop` skills in [pstack](https://github.com/cursor/plugins/tree/main/pstack), a public plugin for Cursor. This OS keeps them as a convention, not a skill: they are a locked default that every page follows, not a step an agent invokes.
