---
name: enhance-daily-update
description: >-
  Append one perspective section to today's burndown in a private operations
  record using that person's own connectors. Not a launch playbook.
---

# enhance-daily-update

After `daily-burndown` has written the Overview, a later run adds **one** perspective section (for example front end, or back end and devops) from that person's own connectors. Apply [conventions/agent-work-logging.md](../../conventions/agent-work-logging.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## Parameters (from the routine or asker)

| Input | Meaning |
| --- | --- |
| Perspective | A short label such as `front-end` or `back-end-devops`. |
| Section heading | Exact markdown heading to own in the day file (for example `## Perspective A`). |
| Operations record | Private repository path or remote named by the routine. |

## Perspective notes

- **Front end:** UI, design, design files, accessibility, client-visible changes, component and stylesheet work, front-end CI.
- **Back end and devops:** APIs, infrastructure, deploys, CI pipelines, incidents, hosting, security, data and migrations.

## When to use

- A teammate's scheduled add-on should enrich today's burndown from their own view.
- The Overview already exists (or the routine says to create the day file from the template and note that Overview was not ready).

## Hard rules

- **Own section only.** Append or replace the matched heading. Never edit Overview or another perspective's section.
- **Own connectors only.** Do not use another person's private mail, calendar, or direct messages.
- **By project.** Fill the owned section the same way Overview is filled: one `### <Project>` per project that had work from this perspective, optional `Client:` line when the private record has a CRM folder, then only the `####` activity headings that have content (Tickets, Email, Slack, Meetings / notes, Ships / merges, Blocked / next) with flat `- ` bullets. Prefer the same project names Overview used. Omit empty `####` headings.
- **No duplicates.** Skip points already covered in Overview.
- Work only; Slack Connect / external client channels are work sources when the team uses them; no personal chatter; no billing amounts; no secrets; do not name bots.

## Steps

1. Resolve the date (default: today in the team's local timezone).
2. Open today's day file in the operations record. If it is missing, wait per the routine, or create it from [templates/ops/burndown-day.md](../../templates/ops/burndown-day.md) with an empty Overview and a note that the overview run had not finished.
3. Gather work-only signals from this person's connectors for that day.
4. Write only the owned section, by project, with `####` activity headings. Keep summaries short; do not quote direct messages or mail when a one-line work point will do.
5. Commit with a clear message that names the date and the perspective. Never rewrite history.
6. Stay quiet if there is nothing new from this perspective.

## Stop

Complete when the owned section is updated and committed, or when there was nothing new to add and the run stayed quiet. Not complete if another section was edited.
