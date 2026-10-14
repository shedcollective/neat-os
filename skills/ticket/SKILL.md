---
name: ticket
description: Create a new Jira Task, or enhance an existing one, from a brief or a ticket key. Applies conventions/ticket-content.md (sections, acceptance criteria, client-readable tone) plus the project's Tickets slot. The ticket records only the final decided outcome, stated as fact. When facts are missing after asking, the ticket still goes in and names what is needed from the client or the reporter. Writes to Jira (or GitHub Issues for an OS repo) only, never to the repository. No estimates, priority, status or assignee. Not init, gather or learn.
---

# ticket

Create a ticket, or bring an existing one up to standard. The ticket describes a **problem and an outcome** the client can read. It does not describe how a developer will build it.

The shape, the acceptance criteria rule, and the tone rules are locked in [conventions/ticket-content.md](../../conventions/ticket-content.md). Read that page first, every run. This playbook only orders the steps.

## Hard rules

- **Write to the ticket system only.** Do **not** write, stage or commit anything in the repository: no feature plan under `.agents/features/`, no notes, no draft file. The developer who picks the ticket up writes the plan then.
- **Jira issue type is Task.** Never Story, Bug, Epic or Sub-task. A bug is a Task with How to replicate filled.
- **Set nothing a person triages.** No estimate, no story points, no priority (leave the project default), no status transition, no assignee unless the person named one. A new ticket lands in the first column ("Reported" or the project's equivalent).
- **Ask, never invent.** Why, What and Acceptance criteria are required. If one is unknown, ask the person once, in one batch. What still cannot be answered (nobody present, or the person does not know) does not stop the ticket: leave that section out and put the question under **More information needed**, addressed by role to the client contact or the reporter. Do not create a ticket with `TBC`, `to confirm` or a guessed section.
- **Record only the decided outcome.** These three rules apply to every ticket, including one that is being enhanced. A ticket must make sense in isolation and record only the final decided outcome, stated as fact. It must not contain the original request text, meeting discussion, options considered, attributions, or a partial history of how the decision was reached. When a decision changes, rewrite the ticket body to the new decision instead of appending history. The convention page is the source of truth.
- **The client reads it.** Nothing about the agent, the conversation, the codebase search, cost, margin, other clients, credentials or private URLs. Tone per the convention: British English, short active sentences, the client's own names for things, no filler words, no emoji.
- **Enhance rewrites the body.** Replace the description with the current decided outcome. Comments stay as they are. Type, status, priority, assignee, estimate, labels and components stay as they are.
- **No adapter in neat-os.** Use whatever ticket tool the runner already has (a Jira MCP tool, a Jira CLI, `gh issue`). If none is available, stop and say so; do not install one or search the public web for a Jira client.
- Company knowledge comes from the resolved neat-os tree. Locate it the same locked way `init` does (`resolve-consume.sh` or `require('@shedcollective/neat-os').resolveConsume()`): `NEAT_OS_ROOT`, then `node_modules/@shedcollective/neat-os`, then `vendor/shedcollective/neat-os`, then sibling `../neat-os`. `SHED_OS_ROOT` and the shed-os package paths still resolve and are deprecated (`docs/consume.md`). Do **not** search the public web for neat-os.

## When to use

- A person or an agent has a brief ("customers cannot download invoices", "add a cookie banner") and wants it in Jira.
- A ticket exists but is a one-liner, a pasted email, or missing acceptance criteria, and someone asks to enhance it.
- A bug was found during development or QA and needs a ticket that states what is wrong and the outcome.

## When not to use

- Deciding how to implement the change. That is the developer's job after the ticket is picked up.
- Scaffolding or filling `.agents/` (that is `init` and `gather`) or proposing skills (that is `learn`).
- Opening the pull request that implements a ticket. This playbook stops when the ticket exists.
- Creating an Epic, a release, or a sprint. The project manager does that.

## Inputs

| Input | Where it comes from |
| --- | --- |
| Mode | `enhance` when the person asked to update, tidy, improve or enhance a named key (`ACME-123`, `GH-42`). `create` otherwise. A key mentioned only as context ("like ACME-100 but for invoices") is a Link, not the target. |
| Brief | The person's words in chat, a pasted email or Slack message, or the body of the existing ticket. |
| Ticket system and project key | `.agents/project.md` → Ticket prefix (Jira key for a product repo; `GH` for an OS repo, per [conventions/tickets.md](../../conventions/tickets.md)). If it is `TODO / ask`, ask once. |
| Jira site URL, default labels or components, client vocabulary, standing acceptance criteria | `.agents/project.md` → Tickets. Empty slots mean "none"; do not invent them. |
| Repository pointers (optional) | Read-only look at the tree for the page, template or module where the behaviour lives today. Goes in Links as a pointer. |

## Steps

1. **Confirm the repository and locate neat-os.** `git rev-parse --show-toplevel`. Resolve neat-os with the locked order (`resolve-consume.sh`). Read `conventions/ticket-content.md` and `conventions/tickets.md` from that tree. Read `.agents/project.md` in the product repo for the ticket prefix and the Tickets slot. If `.agents/project.md` is missing, ask for the Jira project key directly; do not run `init` or `gather` as a side effect.

2. **Pick the mode.** If the person asked to update, tidy, improve or enhance a named key, the mode is `enhance`: fetch that ticket (summary, description, comments, attachments list) with the available tool. The existing description and comments are context for the writer. They are not copied into the ticket. Any other request is `create`. The brief is context the same way: it informs the sections, and its text does not go into the ticket. A key that is only context goes in Links.

   Before a `create`, search the project for an open ticket about the same problem (Jira: a JQL search on the project key and two or three words from the brief; GitHub: `gh issue list --search`). If one exists, show it and ask whether to enhance that ticket instead. When nobody is present, report the match and continue with `create` only if the request said to create.

3. **Collect the required sections.** From the brief, fill Title, Why, What and Acceptance criteria. State the decided outcome as fact. Add How to replicate when the brief describes something broken. Add Out of scope when the brief invites assumptions. For anything required that the brief does not say:
   - Person present: ask in one batch, in plain questions ("Who is affected when this happens?", "What should a customer see once this is done?"). Ask once; do not chase.
   - Still unknown after asking, or nobody to ask: the ticket still goes in. Fill each section as far as the facts support and leave out what nothing supports. Add a **More information needed** section first in the description, before Why, one question per line, each addressed by role to the person who can answer it (client contact, reporter, whoever forwarded the request), in words that person can answer without technical knowledge. Write only the acceptance criteria the known facts support; when none do, leave the section out and ask for the expected outcome as a question. When the class is unclear, the title names the problem as reported. The convention's second Example shows the shape.
   - Do not put a question to the developer in that section. If the only open questions are technical, the ticket is clear enough.

4. **Look for pointers, read-only.** When it helps the developer, find the page, template, route or module in the repository where the behaviour lives today and add it to Links as a path or URL. Do not paste code. Do not describe a fix. Do not write anything to the repository. Skip this step when the repository is not the one the ticket is about.

5. **Draft the ticket** in the section order from the convention, matching its Example. Then check it against the convention before showing it to anyone:
   - Title under 70 characters, sentence case, names the outcome for a new capability or the breakage for a fix or bug.
   - Every acceptance criterion starts "Done when" and a non-developer could check it.
   - Standing acceptance criteria from the Tickets slot appended.
   - Client vocabulary from the Tickets slot used (UAT, not staging, if that is what the client says).
   - No technical design, no agent process, no filler words from the convention's list, no emoji, no placeholder.
   - The body is only the decided outcome: no original request text, meeting discussion, options considered, attributions, or history of how the decision was reached.
   - More information needed present only when a section could not be filled; every line in it is a question with a named person, and no other section carries a gap.
   - Read it aloud in your head as the project manager on a client call. Rewrite anything that would not be said that way.

6. **Gate.** Show the draft.
   - If the person or the calling agent has already asked for the ticket to be created or enhanced ("create it", "put this in Jira", "tidy up ACME-123"), continue to step 7 without waiting.
   - Otherwise, when a person is present, wait for them to say create, change or drop. Apply changes and show the draft again.
   - When nobody is present and the request did not include the instruction to create, stop here with the draft.

7. **Write to the ticket system** with the tool the runner has.
   - `create`, Jira: project from the ticket prefix, issue type Task, summary is the Title, description is the sections in order with the section names as headings, in the format the tool accepts (Jira wiki markup or the tool's rich text, not Markdown `##`). Labels or components only if the Tickets slot lists defaults. Nothing else set.
   - `create`, GitHub Issues (OS repo): `gh issue create` with the Title and the same body in Markdown.
   - `enhance`: update the summary when the decided outcome has changed or when the convention's title rules require it, and replace the description with the rewritten sections. The previous description does not stay in the body. A section the ticket, its comments and the person asking cannot fill becomes a question under More information needed, addressed by role to the ticket's reporter or the client contact. Answers found in the comments or the request move into their sections as fact and the answered question goes. Do not change any other field. Do not add a comment unless asked.
   - Attachments: upload when the tool can. When it cannot, keep the Attachments section naming each file and tell the person to attach them.
   - After writing, open or fetch the ticket once and check the headings and the checklist render. Fix formatting if they do not.

8. **Report and stop.** Print the key and URL, the mode, which sections were added or left out and why, the open questions and who each is addressed to, and the sentence "Nothing was written to the repository." Do not open a branch, plan or pull request. Next, if anyone asks, is implementation by a developer, who starts from the ticket, or a second run in enhance mode once the answers are in.

## Stop

The playbook is complete when the ticket exists in the ticket system in the locked shape, with any gaps named as questions under More information needed, or when the gate in step 6 stopped it with a draft. It is not complete if a required section was guessed, if a gap was left inside a section instead of under More information needed, if anything was written to the repository, or if a field a person triages was set.
