---
name: enhance-daily-update
description: >-
  Append perspective detail into today's shared burndown in a private operations
  record using that person's own connectors. Default layout is by project; a
  passport may name other top-level sections. Not a launch playbook.
---

# enhance-daily-update

After `daily-burndown` has written the shared day body, a later run adds detail **from one perspective** (for example front end, or back end and devops) using that person's own connectors. The default day shape is by project. A bot passport may name other top-level sections. Apply [conventions/agent-work-logging.md](../../conventions/agent-work-logging.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## Parameters (from the routine or asker)

| Input | Meaning |
| --- | --- |
| Perspective | A short label such as `front-end` or `back-end-devops`. Used in the commit message and to filter what to add. It is a top-level day-file heading only when the bot passport's Day file table names it. |
| `<ops-record>`, `<timezone>`, `<connectors>`, `<write-rule>`, `<quiet-when-empty>` | As defined in [conventions/routine-settings.md](../../conventions/routine-settings.md). `<connectors>` are this person's own. |

## Perspective notes

- **Front end:** UI, design, design files, accessibility, client-visible changes, component and stylesheet work, front-end CI.
- **Back end and devops:** APIs, infrastructure, deploys, CI pipelines, incidents, hosting, security, data and migrations.

## When to use

- A teammate's scheduled add-on should enrich today's burndown from their own view.
- The shared day body already exists (or the routine says to create the day file from the template and note that the overview run had not finished).

## Hard rules

- **Same sections.** Append into the headings the overview run used. Prefer the same names. Create a new `###` heading only when this perspective has work for a section that is not yet in the file and that heading is either a default project section or a heading the passport named.
- OS does not forbid named top-level sections. Do not invent a heading the passport did not name, unless using the default by-project shape.
- **Do not** rewrite Agency state People, or remove another person's bullets, unless correcting a verified factual error the routine asks for.
- **Own connectors only.** Do not use another person's private mail, calendar, or direct messages.
- **By project, unless the passport says otherwise.** Under each section, use only the `####` activity headings that have new content, with flat `- ` bullets. Omit empty headings.
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

Complete when the shared day body is updated and committed, or when there was nothing new to add and the run stayed quiet. Not complete if a heading the passport did not name was invented, or another person's section was overwritten without cause.
