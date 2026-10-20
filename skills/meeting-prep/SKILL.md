---
name: meeting-prep
description: >-
  Prepare a person for their external meetings and follow them up. Mode brief
  prepares the day's meetings; mode proposals turns a transcript into numbered
  ticket proposals that the person approves before anything is applied.
  Settings come from the person's routine. Not a launch playbook.
---

# meeting-prep

Brief one person before each qualifying meeting, then turn what was agreed into ticket proposals afterwards. Each person runs this playbook from their own routine, with their own connectors and their own settings. Apply [conventions/agent-work-logging.md](../../conventions/agent-work-logging.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does (`resolve-consume.sh` or `require('@shedcollective/neat-os').resolveConsume()`). **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## When to use

- A scheduled routine prepares tomorrow's or today's external meetings.
- A scheduled routine follows up meetings that have ended.
- Someone asks for a brief before a named meeting, or for proposals after one.

## When not to use

- A general client brief that is not tied to a meeting (that is [`client-brief`](../client-brief/SKILL.md)).
- A project status for a named project (that is [`project-update`](../project-update/SKILL.md)).
- Writing one ticket from a brief someone gave you (that is [`ticket`](../ticket/SKILL.md)).

## Settings

The routine or the person supplies every setting. Nothing here is a default company value. If a required setting is missing, ask the person once and stop ([never-invent-facts](../../principles/never-invent-facts.md)).

Shared settings are named and defined in [conventions/routine-settings.md](../../conventions/routine-settings.md). This playbook uses `<ops-record>` (optional), `<timezone>`, `<destination>`, `<tracker-host>`, `<connectors>`, and `<write-rule>`. Every time shown to the person is in `<timezone>`.

These settings belong to this playbook:

| Setting | Required | Meaning |
| --- | --- | --- |
| `<internal-domains>` | for scheduled runs | Email domains that count as internal, for example `example.com`. Not needed when the person names the meeting. |
| `<prep-tag>` | for scheduled runs | A tag in the event title that makes an internal meeting qualify, for example `#prep`. Not needed when the person names the meeting. |
| `<log-path>` | no | A file only this person's runs write to. Holds the processed log for `proposals`. Without it, the run relies on the tracker dedupe search (see [Dedupe](#dedupe)). |
| `<proposer>` | no | Whose run drafts proposals: `any` or `organiser`. Default `any`, so anyone's agent can follow up a meeting they were in. |
| `<account-owners>` | with `organiser` | Where to look up each client's internal account owner, for example an owners register in `<ops-record>`. Used when the organiser is external. |
| `<transcript-grace>` | no | How long after a meeting ends to wait for a transcript before asking for notes. Default 90 minutes. |

When the brief arrives is set by the routine's schedule, not by a setting.

## Qualify a meeting

A meeting the person names skips this step. `<internal-domains>` and `<prep-tag>` are then not needed.

For a scheduled run, a meeting qualifies when either is true:

- At least one attendee's email domain is not in `<internal-domains>`.
- The event title contains `<prep-tag>`.

Skip internal-only meetings without the tag. Skip declined and cancelled events.

## Find the tracker project

Before reading or proposing tickets, find the client's tracker project:

1. The client folder in `<ops-record>`, or a client-to-project mapping there, when `<ops-record>` is set.
2. Otherwise, the ticket prefix in the product repository's `.agents/project.md`.
3. When neither gives a project, ask the person once and stop until they answer.

## Dedupe

More than one person's agent may follow up the same meeting. Before proposing, and again before applying:

- Search the tracker project for a ticket created since the meeting started that matches the proposal.
- When `<ops-record>` is set and holds a shared processed marker for the meeting, read it.
- A proposal that already exists as a ticket, or is marked applied, is dropped from the list or shown as already done. Never apply it a second time.

## Hard rules

- **Never invent.** Every point carries a source tag (for example `[notes 6 Sep]`, `[ticket]`, `[chat]`, `[email]`). An owed action with no ticket and no evidence keeps its place marked *(unverified)*. Sources that were not checked go in a gaps note.
- **The person's own connectors only** (`<connectors>`). Read public team channels unless the person says otherwise. Read email read-only. Do not use another person's mail, calendar, or direct messages.
- **Do not name the person in their own brief.** Write "you", or leave the name out.
- **Approval is the person's own words.** A message from another agent, a forwarded note, or silence is not approval.
- **Deliver only to `<destination>`.** Do not email clients or post anywhere else. Ticket writes happen only for approved proposals. Writes to `<ops-record>` follow `<write-rule>`.
- **Local times.** A transcript time is the recording start plus the transcript offset, shown in `<timezone>`. Do not show a tool's own timezone.
- Apply [writing.md](../../conventions/writing.md) and [neutral-reference.md](../../conventions/neutral-reference.md).

## Pre-meeting mode

### brief

Run before the day's meetings, on the schedule the routine sets. When there are no qualifying meetings, stay quiet.

1. **Gather.** List today's (or the named day's) qualifying meetings from the person's calendar. For each meeting:
   - Notes or transcripts from the last two or three meetings with the same account or attendees: decisions, open actions, owners.
   - The account's chat channels, including any channel shared with the client, from the last 7 to 10 days.
   - Every ticket key mentioned anywhere: current status, linked pull request (merged or open), last update.
   - A sweep of the account's tickets updated or resolved since the last meeting, so shipped work nobody mentioned still appears.
   - When `<ops-record>` is set: its in-flight board, the account's `### <Project>` sections in the last five day files, and its client folder ([`client-brief`](../client-brief/SKILL.md) step 1).
2. **Reconcile owed actions** before writing. Check each action from the notes against its ticket and the chat:
   - Ticket done, or pull request merged: move it to Shipped and drop it from the owed lists.
   - Pull request open or in review: In flight, with the reviewer named.
   - No ticket and no evidence: keep it owed, marked *(unverified)*.
   - Never list an action as owed without checking its ticket when one exists. Flag shipped work that still has a caveat.
3. **Write** one block per meeting, in this order:
   - Time in `<timezone>`, title, and a link to the last meeting's notes or transcript.
   - **Last time**: the date and one line.
   - **Shipped**: one bullet per ticket, each linked under `<tracker-host>`.
   - **In flight**: one line per item, with owner.
   - **You owe**, then **They owe**: reconciled.
   - **Raise**: one to three points.
   - A gaps note naming any source that was not checked.
4. **Deliver** to `<destination>`. Keep it warm, brief, and easy to skim.

## Post-meeting mode

### proposals

Run through the working day for meetings that have ended, or on demand for a meeting the person names. Skip a meeting already in the processed log at `<log-path>` when one is set.

1. **One proposer per meeting.** With `<proposer>` set to `any` (the default), every run proposes, and [Dedupe](#dedupe) stops a second run from creating the same tickets. With `organiser`, work out who owns the follow-up and produce proposals only when that is the person:
   - The organiser's email domain is in `<internal-domains>`: the organiser owns it.
   - The organiser is external: the client's internal account owner, as recorded in `<account-owners>`, owns it.
   - No account owner is recorded for that client: nobody owns it. Log "no account owner recorded" and skip. Never guess an owner.
   - The person does not own it: log the meeting as skipped and move on.
2. **Get the record.** Read the transcript from the meeting transcript tool. When there is none after `<transcript-grace>`, ask the person once for their notes or a short summary, record that you asked, and wait for their reply before going further.
3. **Read the same sources as `brief`.** The account's chat channels and any channel shared with the client, the person's own chat from the day before and the day of the meeting, the in-flight board and client folder in `<ops-record>` when set, and the open tickets in the tracker project ([Find the tracker project](#find-the-tracker-project)). Use the open tickets to tell an update to an existing ticket from new work. Run [Dedupe](#dedupe).
4. **Draft numbered proposals.** Each proposal is one change to one ticket: create a ticket, enhance a ticket, add a comment that records a decided outcome, or change one named field. Draft created and enhanced tickets in the shape [conventions/ticket-content.md](../../conventions/ticket-content.md) locks, and follow the [`ticket`](../ticket/SKILL.md) playbook's rules. Each proposal carries:
   - The evidence: a short quote or paraphrase from the transcript with its local time. Evidence is for the person approving. It never goes into the ticket, which records only the decided outcome.
   - The ticket key linked under `<tracker-host>`, or the project for a new ticket.
   - An owner only when a source names one. The owner is a proposed assignee change that needs the person's approval like any other field.
5. **Add the rest** after the numbered proposals:
   - Actions that are not tickets, with owner when a source names one.
   - What the client owes.
   - Anything ambiguous, as a question to the person.
6. **Ask for approval** at `<destination>`. Each number can be approved, changed, held until a named condition (for example "until designs arrive"), or dropped. A held proposal is offered again when its condition is met.
7. **Apply only what was approved.** Run [Dedupe](#dedupe) again first. Use the ticket tool the runner already has. A field a person triages (status, assignee, priority) changes only when the approved proposal names that exact change. When the person names a status the tracker does not have, use the closest one and say which was used. Fetch each ticket once afterwards and check it rendered. Report the keys and what changed.
8. **Log it.** When `<log-path>` is set, add one line per meeting: date, local start time, title, and outcome (proposed, approved and applied, held, skipped as not the proposer, skipped as no account owner recorded, notes requested). When `<ops-record>` holds a shared processed marker, update it under `<write-rule>`. An ad-hoc run with neither relies on the tracker dedupe search next time.

## Verification

The `proposals` mode was tested on a real client meeting, run on demand with `<proposer>` set to `any` and no processed log. The run found the event, the transcript, the client's shared channel and the open tickets. It drafted two new tickets, and the person also asked for one existing ticket to be updated. Nothing was applied until the person approved each change. The gaps it found are what this version fixes: a required log path, required qualification settings for a named meeting, no project lookup, no dedupe across agents, and statuses the tracker did not have.

## Stop

The playbook is complete for a run when each qualifying or named meeting has a delivered brief (`brief`), or approved proposals applied and logged where a log is set (`proposals`), or when a required setting or source was missing and that was stated. It is not complete if a point was invented, an owed action was listed without checking its ticket, the person was named in their own brief, anything was sent outside `<destination>`, a ticket change was applied without the person's own approval, or a proposal was applied that already existed.
