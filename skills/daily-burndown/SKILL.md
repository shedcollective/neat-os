---
name: daily-burndown
description: >-
  Write the day's work digest into a private operations record and refresh the
  in-flight board. Work sources only.
---

# daily-burndown

Collect the day's work activity from the asker's connected sources and write one day file plus a refreshed in-flight board into `<ops-record>`. Apply [conventions/agent-work-logging.md](../../conventions/agent-work-logging.md).

When [`ops-capture`](../ops-capture/SKILL.md) runs during the day, the day file may already hold captured lines. This run consolidates those lines and does not rediscover the items they came from.

## Settings

The routine supplies these values, named as in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<ops-record>`, `<timezone>`, `<connectors>`, `<write-rule>`, and `<quiet-when-empty>`. If a required setting is missing, ask once and stop.

When the record runs `ops-capture`, the wrapper also names its `<capture-marker>` (default `capture/YYYY/MM/processed.md`). Without it, there are no captured lines to consolidate.

## When to use

- A scheduled end-of-day update should summarise the working day into the operations record.
- Someone asks for today's (or a named day's) burndown in that record.

## When not to use

- Filling a product repo's `.agents/` (that is `gather`).
- Proposing elevations into neat-os (that is `learn`).
- Writing accounting-system or billing tooling detail into the record.

## Hard rules

- **Work only.** Follow [agent-work-logging.md](../../conventions/agent-work-logging.md). Direct messages are logged only when clearly work, and only as a short summary. When the team uses Slack Connect or other external client channels, treat those as work sources the same way as agreed team channels.
- **`<connectors>` only.** Never invent a source that is not connected. List missing sources under Sources unavailable ([never-invent-facts](../../principles/never-invent-facts.md)).
- **No billing amounts** in the day file or the in-flight board.
- **No secrets** ([never-store-secrets.md](../../conventions/never-store-secrets.md)).
- Write the **shared day body** only. The default is Agency state, project sections, Agency, Sources unavailable. Fill **by project**, not by source type, unless the bot passport names other top-level sections (for example by discipline). When it does, those headings replace the project block. Agency state stays first. Sources unavailable stays last. OS does not forbid named top-level sections. Leave later perspective detail for `enhance-daily-update`, which appends into the same sections.
- When there is nothing work-related to report, follow `<quiet-when-empty>`: stay quiet, or write an explicit empty stub.
- One line per fact. Do not invent holidays, absences, or leave from a misread message.
- **Do not duplicate captured lines.** An item whose source id is in `<capture-marker>` is already logged. Do not write it again. Keep every captured fact. Two captured lines about the same thread may be merged into one line that keeps both facts. Never overwrite another owner's lines.

## Day shape

Use [templates/ops/burndown-day.md](../../templates/ops/burndown-day.md) (or the record's own copy) unless the bot passport's Day file table names other top-level headings.

Default shape:

1. `### Agency state` first, with `#### People` (holidays, OOO, absences, cover, only when verified) and `#### Notable` (sparse later-useful agency facts).
2. One `### <Project>` per project that had work today. Optional `Client:` line when the private record has a CRM folder. Then only the `####` activity headings that have content: Tickets, Email, Slack, Meetings / notes, Ships / merges, Blocked / next. Flat `- ` bullets under each; omit empty headings.
3. `### Agency` for cross-cutting delivery that is not one project (same activity headings; omit empty).
4. `### Sources unavailable` for connectors that were missing or failed.

When the passport names top-level sections, keep Agency state first and Sources unavailable last, and use those named headings in place of the project block. Do not invent a heading the passport did not name.

## Steps

1. **Resolve the date** in `<timezone>` (default: today). Build the day path the record uses, typically `burndown/YYYY/MM/YYYY-MM-DD.md`.
2. **Confirm `<ops-record>`** (clone or remote). Stop if it is missing.
3. **Read what was captured.** When `<capture-marker>` is set, read today's entries and the existing day file. Treat each listed source id as logged.
4. **Collect work activity** for that local day from `<connectors>`: version control pushes and pull requests, team channels, Slack Connect / external client channels when the team uses them, the asker's work-related direct messages, calendar meetings (including OOO / holiday calendars), meeting notes, work email, and tickets that moved. Skip items already logged in step 3.
5. **Draft the day file** from the template, or from the passport Day file table when it has rows. Agency state first. Sources unavailable last. When the day file already exists, keep its lines and add to them. Do not rebuild it from scratch.
6. **Refresh the in-flight board** in that record: project, what is in flight, owner, done when, blocked.
7. **Commit** the day file and the in-flight board per `<write-rule>` (normally direct to the default branch for those two paths). Never rewrite history. Prefer merge commits on feature branches ([conventions/git.md](../../conventions/git.md)).
8. **Voice:** British English, short active sentences. Lead with the decision, the owner, and the next move. Do not name bots ([conventions/writing.md](../../conventions/writing.md), [agent-work-logging.md](../../conventions/agent-work-logging.md)).

## Stop

The playbook is complete when the day file and in-flight board are written (or when it stayed quiet because there was nothing to report), or when a required source or record was missing and that was stated. It is not complete if personal material, billing amounts, secrets, or invented leave facts were written into the record, or if a captured line was written a second time or dropped.
