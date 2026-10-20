---
name: daily-digest
description: >-
  Distil today's burndown day file into a short end-of-day post a person can
  read in a moment, and deliver it to the routine's destination. Not a launch
  playbook.
---

# daily-digest

Turn the day file that `daily-burndown` (and any `enhance-daily-update` runs) wrote into one short post: what actually happened today that is worth knowing, who is out, and what is on tomorrow. Apply [conventions/agent-work-logging.md](../../conventions/agent-work-logging.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## When to use

- A scheduled end-of-day routine posts the day's highlights to a team channel, after the day file is written.
- Someone asks for today's (or a named day's) digest.

## When not to use

- Writing or extending the day file (that is `daily-burndown` or `enhance-daily-update`).
- A status for one named project (that is [`project-update`](../project-update/SKILL.md)).
- One person's morning message (that is [`morning-brief`](../morning-brief/SKILL.md)). `daily-digest` is the end-of-day team post. The composition rule is on [docs/agency-ops.md](../../docs/agency-ops.md).

## Settings

The routine supplies these values, named as in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<ops-record>`, `<timezone>`, `<destination>`, `<connectors>` (for tomorrow's calendar), and `<quiet-when-empty>`. If a required setting is missing, ask once and stop.

## Format

A normal post, **not a code block**. Use the chat tool's own bold. One blank line between blocks.

```
*<Team> daily · <Ddd D Mon>*

<emoji> *<Project>*
<who did what, or who does what by when, in plain English>
<optional second line>

<emoji> *<Project>*
<one line>

———

👤 *People*
<name> on leave (back <day>)

📅 *Tomorrow*
HH:MM <meeting> (<who>)
```

- One emoji per project that hints at the news (for example ☁️ a launch or migration, ⏸️ held, 📐 design or planning, 📋 waiting on the client, ✅ shipped, ⚠️ a risk). Keep the set small and consistent day to day.
- One or two lines per project. Each line says who did or does what, and by when when it matters.
- People lists only verified leave, absence, or cover from the day file's `#### People`. Omit the block when it is empty.
- Tomorrow lists meetings worth knowing in `<timezone>`, `HH:MM` first, then the meeting and who is in it. Omit the block when it is empty.

## Hard rules

- **Distil, do not dump.** Include only what someone outside the project would want to know: launches, decisions, blockers, holds, client approvals, risks. Skip quiet projects and routine ticket moves.
- **No bare deadlines.** Write "<person> to estimate <thing> before tomorrow's 14:00 check-in", not "estimate before Tue 14:00".
- **Never invent.** Every line comes from the day file, the in-flight board, or the calendar. Never infer leave from a misread message ([never-invent-facts](../../principles/never-invent-facts.md)).
- No billing amounts, secrets, personal material, or bot names. British English ([writing.md](../../conventions/writing.md)).
- Deliver only to `<destination>`.

## Steps

1. Resolve the date in `<timezone>` (default: today).
2. Open the day file in `<ops-record>`. If it is missing, follow `<quiet-when-empty>` and stop.
3. Read `### Agency state`, every `### <Project>` section, and `### Agency`. Read the in-flight board for owners and dates.
4. Read tomorrow's calendar from `<connectors>` for team meetings worth listing.
5. Pick the notable projects and draft the post in the format above.
6. Check each line names a person or an outcome and has context for any time it mentions.
7. If nothing is notable, follow `<quiet-when-empty>`. Otherwise post to `<destination>`.

## Stop

Complete when the post is delivered to `<destination>`, or when the run stayed quiet because there was no day file or nothing notable. Not complete if the post was a code block, carried a bare deadline, listed unverified leave, or included amounts or personal material.
