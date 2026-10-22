---
name: morning-brief
description: >-
  Compose one morning message per person from Needs you, Today, Meetings,
  Health, and Pipeline (Mondays). Replaces separate morning health, digest,
  day-plan, and meeting-prep brief messages. Adds no new facts. Not a launch
  playbook.
---

# morning-brief

Compose **one** morning message for the asker, from facts that already exist. This replaces separate morning health, digest, day-plan, and meeting-prep brief messages. It does **not** replace [`daily-digest`](../daily-digest/SKILL.md), which remains the end-of-day team post. Meeting follow-up still uses [`meeting-prep`](../meeting-prep/SKILL.md) mode `proposals`.

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

The composition rule sits with `daily-digest` on [docs/agency-ops.md](../../docs/agency-ops.md).

## When to use

- A scheduled morning routine should tell one person what needs them today, in a single message.
- Someone asks for this morning's brief.

## When not to use

- The end-of-day team post (that is [`daily-digest`](../daily-digest/SKILL.md)).
- Writing the day file (that is [`daily-burndown`](../daily-burndown/SKILL.md)).
- An on-demand brief for a named meeting that is not this morning's message, or ticket proposals after a meeting (that is [`meeting-prep`](../meeting-prep/SKILL.md)).
- A red production build or any other urgent alert. Alert that at once. This playbook does not delay that alert and does not replace it.

## Settings

The routine supplies these values, named as in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<ops-record>`, `<timezone>`, `<destination>`, `<connectors>`, `<tracker-host>`, and `<quiet-when-empty>`. The Meetings section also uses the `brief` settings in [`meeting-prep`](../meeting-prep/SKILL.md) (`<internal-domains>`, `<prep-tag>`). If a required setting is missing, ask once and stop.

A team bot does not run this routine without a filled bot passport ([docs/team-setup.md](../../docs/team-setup.md#team-bots)).

## Composition

The brief **adds no new facts**. Every line comes from a source below. Omit a section that has nothing to say. Do not write "none" or "all green" inside a section.

Sections appear in this order:

1. **Needs you** — From the in-flight board and the latest day file in `<ops-record>` (written by `daily-burndown`): items that need this person's decision, unblock, or review today. Link ticket keys under `<tracker-host>`.
2. **Today** — The day plan. From today's calendar on `<connectors>`, and in-flight items this person owns. Reuse yesterday's `daily-digest` Tomorrow block when that post is available in `<ops-record>` or `<destination>`. Do not re-run `daily-digest`.
3. **Meetings** — Today's qualifying meetings, using the `brief` composition in [`meeting-prep`](../meeting-prep/SKILL.md) (qualify, gather, reconcile owed actions, write Last time / Shipped / In flight / You owe / They owe / Raise). Omit when there are none. Do not send a separate `meeting-prep` brief from this run.
4. **Health** — Production and required-check status from `<connectors>` (version control, hosting). There is no separate health-check playbook. Omit this section when everything is green.
5. **Pipeline** — Mondays only, using the weekday in `<timezone>`. From pipeline or new-business notes in `<ops-record>`, including the bids register when one exists. Omit on other days, and omit when the record has none.

A missing source means the section is omitted. Do not invent a line to fill it ([never-invent-facts](../../principles/never-invent-facts.md)).

## Format

A normal post, **not a code block**. Use the chat tool's own bold. One blank line between sections. Do not name the person in their own brief; write "you", or leave the name out.

```
*Morning · <Ddd D Mon>*

*Needs you*
<one line: what you need to do, with the source>

*Today*
HH:MM <event>
<in-flight item you own>

*Meetings*
HH:MM <title>
<Last time / Shipped / In flight / You owe / They owe / Raise>

*Health*
<one line of notable status>

*Pipeline*
<one line>
```

Drop any section that would be empty. Drop **Pipeline** when it is not Monday in `<timezone>`. Drop **Meetings** when there are no qualifying meetings.

When every section is empty (nothing needs the person, health is green, no day-plan lines, no pipeline):

- If `<quiet-when-empty>` is `yes`, stay silent.
- If `<quiet-when-empty>` is `no`, post one line: `*Morning · <Ddd D Mon>* · all green`.

## Hard rules

- **One message.** Do not also send a separate morning health, digest, day-plan, or meeting-prep brief message from this run.
- **Adds no new facts.** Distil, do not dump. Skip quiet projects and routine ticket moves.
- **Urgent alerts stay immediate.** A red production build still alerts at once. This playbook does not delay that alert and does not replace it. If a red is still open when the brief runs, **Health** or **Needs you** may mention it.
- The person's own connectors only (`<connectors>`). Never another person's.
- No billing amounts, secrets, personal material, or bot names. British English ([writing.md](../../conventions/writing.md), [agent-work-logging.md](../../conventions/agent-work-logging.md)).
- Deliver only to `<destination>`.

## Steps

1. Resolve today's date and weekday in `<timezone>`.
2. Confirm the settings. If a required setting is missing, ask once and stop. If a team bot is running this, confirm a filled bot passport exists and stop if it does not.
3. Read `<ops-record>`: in-flight board, the latest day file, and yesterday's digest Tomorrow block when it was stored. List missing sources; do not invent them.
4. Read `<connectors>` for today's calendar and for production or required-check status.
5. For the Meetings section, run the `brief` steps in [`meeting-prep`](../meeting-prep/SKILL.md) for today's qualifying meetings, but do not deliver them as a separate message.
6. Draft the five sections in the composition order. Omit empties. On a day that is not Monday, omit **Pipeline**.
7. If every section is empty, follow `<quiet-when-empty>` (one line, or silent).
8. Otherwise post the one message to `<destination>`. Do not send the old separate morning messages, and do not send a separate `meeting-prep` brief.

## Stop

Complete when the one morning message is delivered to `<destination>`, or when the run stayed silent because `<quiet-when-empty>` is `yes` and every section was empty. Not complete if a second morning health, digest, day-plan, or meeting-prep brief message was also sent, if a fact was invented, if an empty section was padded, or if an urgent alert was delayed until this brief.
