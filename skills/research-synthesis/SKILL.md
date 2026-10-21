---
name: research-synthesis
description: >-
  Turn interview notes or transcripts into themes, quotes with sources, and
  opportunities. No personal data in the output. Report only.
---

# research-synthesis

Read notes or transcripts the asker can already see, and write a synthesis. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## When to use

- The asker has interview notes or transcripts and wants themes, sourced quotes, and opportunities.

## When not to use

- Auditing a URL or flow (that is [`ux-audit`](../ux-audit/SKILL.md)).
- Writing tickets from the findings (that is [`ticket`](../ticket/SKILL.md), after the asker approves).

## Steps

1. Take the notes or transcripts from the asker's own connectors (Google Drive, meeting transcripts, FigJam). Never another person's.
2. Cluster into themes. For each theme: a one-line claim, quotes with a source (file and date, or a timestamp), and opportunities. Flag unknowns. Do not invent a quote ([never-invent-facts](../../principles/never-invent-facts.md)).
3. Strip personal data from the output: given names, mailboxes, phone numbers, recordings, and anything that would identify a participant. Write "participant" or a role, not a person.
4. Write a **new** draft report. Do not edit a live file. Do not send it to a client. Do not change a ticket's status.

## Stop

Complete when the draft report is delivered to the asker with no personal data in it. Not complete if a person is named, a quote has no source, or a live file was edited.
