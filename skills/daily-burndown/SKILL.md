---
name: daily-burndown
description: >-
  Write the day's work digest into a private operations record and refresh the
  in-flight board. Work sources only. Not a launch playbook.
---

# daily-burndown

Collect the day's work activity from the asker's connected sources and write one day file plus a refreshed in-flight board into the **private operations record** the routine or asker names. Apply [conventions/agent-work-logging.md](../../conventions/agent-work-logging.md).

This is **not** a launch playbook. Do not run it from `init`, `gather`, or `learn`. Locate neat-os the same way those playbooks do (`resolve-consume.sh` / `require('@shedcollective/neat-os').resolveConsume()`). **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## When to use

- A scheduled end-of-day update should summarise the working day into the operations record.
- Someone asks for today's (or a named day's) burndown in that record.

## When not to use

- Filling a product repo's `.agents/` (that is `gather`).
- Proposing elevations into neat-os (that is `learn`).
- Writing accounting-system or billing tooling detail into the record.

## Hard rules

- **Work only.** Follow [agent-work-logging.md](../../conventions/agent-work-logging.md). Direct messages are logged only when clearly work, and only as a short summary.
- **Asker's connectors only.** Never invent a source that is not connected. List missing sources under Sources unavailable ([never-invent-facts](../../principles/never-invent-facts.md)).
- **No billing amounts** in the day file or the in-flight board.
- **No secrets** ([never-store-secrets.md](../../conventions/never-store-secrets.md)).
- Write the **Overview** section only. Leave named perspective sections for `enhance-daily-update`.
- Stay quiet when there is nothing work-related to report, unless the routine requires an explicit empty stub.

## Steps

1. **Resolve the date** in the team's local timezone (default: today). Build the day path the record uses, typically `burndown/YYYY/MM/YYYY-MM-DD.md`.
2. **Confirm the operations record** (clone or remote) the routine names. Stop if it is missing.
3. **Collect work activity** for that local day from connected sources the asker has: version control pushes and pull requests, team channels, the asker's work-related direct messages, calendar meetings, meeting notes, work email, and tickets that moved.
4. **Draft the day file** from [templates/ops/burndown-day.md](../../templates/ops/burndown-day.md) (or the record's own copy of that template). Fill Overview only.
5. **Refresh the in-flight board** in that record: project, what is in flight, owner, done when, blocked.
6. **Commit** the day file and the in-flight board per that record's write rules (often direct to its default branch for those two paths). Never rewrite history. Prefer merge commits on feature branches ([conventions/git.md](../../conventions/git.md)).
7. **Voice:** British English, short active sentences. Lead with the decision, the owner, and the next move. Do not name bots ([conventions/writing.md](../../conventions/writing.md), [neutral-reference.md](../../conventions/neutral-reference.md)).

## Stop

The playbook is complete when the day file and in-flight board are written (or when it stayed quiet because there was nothing to report), or when a required source or record was missing and that was stated. It is not complete if personal material, billing amounts, or secrets were written into the record.
