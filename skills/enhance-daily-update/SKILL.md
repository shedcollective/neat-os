---
name: enhance-daily-update
description: >-
  Append perspective detail into today's shared by-project burndown in a private
  operations record using that person's own connectors. Not a launch playbook.
---

# enhance-daily-update

After `daily-burndown` has written the shared day body, a later run adds detail **from one perspective** (for example front end, or back end and devops) using that person's own connectors. Apply [conventions/agent-work-logging.md](../../conventions/agent-work-logging.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## Parameters (from the routine or asker)

| Input | Meaning |
| --- | --- |
| Perspective | A short label such as `front-end` or `back-end-devops`. Used in the commit message and to filter what to add; it is **not** a top-level day-file heading. |
| `<ops-record>`, `<timezone>`, `<connectors>`, `<write-rule>`, `<quiet-when-empty>` | As defined in [conventions/routine-settings.md](../../conventions/routine-settings.md). `<connectors>` are this person's own. |

## Perspective notes

- **Front end:** UI, design, design files, accessibility, client-visible changes, component and stylesheet work, front-end CI.
- **Back end and devops:** APIs, infrastructure, deploys, CI pipelines, incidents, hosting, security, data and migrations.

## When to use

- A teammate's scheduled add-on should enrich today's burndown from their own view.
- The shared day body already exists (or the routine says to create the day file from the template and note that the overview run had not finished).

## Hard rules

- **Same project sections.** Append into existing `### <Project>` (and `### Agency` when needed). Prefer the same project names the overview run used. Create a new `###` project heading only when this perspective has work for a project that is not yet in the file.
- **Do not** add `## Front end`, `## Back end`, `## Perspective A`, or any other top-level silo.
- **Do not** rewrite Agency state People, or remove another person's bullets, unless correcting a verified factual error the routine asks for.
- **Own connectors only.** Do not use another person's private mail, calendar, or direct messages.
- **By project.** Under each project, use only the `####` activity headings that have new content, with flat `- ` bullets. Omit empty headings.
- **No duplicates.** Skip points already covered in the day file.
- Work only; Slack Connect / external client channels are work sources when the team uses them; no personal chatter; no billing amounts; no secrets; do not name bots; one line per fact.

## Steps

1. Resolve the date (default: today in `<timezone>`).
2. Open today's day file in `<ops-record>`. If it is missing, wait per the routine, or create it from [templates/ops/burndown-day.md](../../templates/ops/burndown-day.md) with Agency state / empty project stubs and a note that the overview run had not finished.
3. Gather work-only signals from `<connectors>` for that day, filtered to the named perspective.
4. Append into the matching `###` project sections (and Agency if needed). Keep summaries short; do not quote direct messages or mail when a one-line work point will do.
5. Commit per `<write-rule>` with a clear message that names the date and the perspective. Never rewrite history.
6. If there is nothing new from this perspective, follow `<quiet-when-empty>`.

## Stop

Complete when the shared day body is updated and committed, or when there was nothing new to add and the run stayed quiet. Not complete if a perspective silo was introduced or another person's section was overwritten without cause.
