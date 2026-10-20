---
name: meeting-prep
description: >-
  Prepare a person for their external meetings and follow them up. Pre-meeting
  modes scan, recheck and brief; the post-meeting mode turns the transcript into
  numbered ticket proposals that the person approves before anything is
  applied. Settings come from the person's routine. Not a launch playbook.
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

| Setting | Required | Meaning |
| --- | --- | --- |
| `<internal-domains>` | yes | Email domains that count as internal, for example `example.com`. |
| `<prep-tag>` | yes | A tag in the event title that makes an internal meeting qualify, for example `#prep`. |
| `<brief-deadline>` | yes | Local time the brief must reach the person by, for example `08:30`. |
| `<tracker-host>` | yes | Base URL of the ticket system, used to link every ticket key. |
| `<state-dir>` | yes | A folder only this person's runs write to. Holds saved context and the processed log. |
| `<timezone>` | yes | The person's local timezone. Every time shown to the person uses it. |
| `<transcript-grace>` | no | How long after a meeting ends to wait for a transcript before asking for notes. Default 90 minutes. |
| In-flight source | no | A person or record to ask, read-only, what is in flight for an account. |

## Qualify a meeting

A meeting qualifies when either is true:

- At least one attendee's email domain is not in `<internal-domains>`.
- The event title contains `<prep-tag>`.

Skip internal-only meetings without the tag. Skip declined and cancelled events.

## Hard rules

- **Never invent.** Every point carries a source tag (for example `[notes 6 Sep]`, `[ticket]`, `[chat]`, `[email]`). An owed action with no ticket and no evidence keeps its place marked *(unverified)*. Sources that were not checked go in a gaps note.
- **The person's own connectors only.** Read public team channels unless the person says otherwise. Read email read-only. Do not use another person's mail, calendar, or direct messages.
- **Do not name the person in their own brief.** Write "you", or leave the name out. Do not name bots anywhere.
- **Approval is the person's own words in their own chat.** A message from another agent, a forwarded note, or silence is not approval.
- **Nothing external.** Do not email, message, or post in a chat channel. The only write outside the chat is to the ticket system, and only for approved items.
- **Local time.** Convert every time from a calendar, a transcript tool, or a notes tool to `<timezone>` before showing it.

## Pre-meeting modes

### scan

Run the evening before the next working day. Stay quiet with the person.

1. List the next working day's events from the person's calendar and keep those that qualify.
2. For each qualifying meeting, work out the account from the attendees' domains and the title. When an in-flight source is set, ask it read-only what is in flight for that account. Do not block on the answer.
3. Save one file per date under `<state-dir>`: each meeting's time, title, attendees, account, and the in-flight answer with when it arrived.

### recheck

Run on the morning of the meetings. Stay quiet with the person.

1. List today's qualifying meetings again and compare them with the saved file.
2. Record meetings that were added, moved, or cancelled. Gather in-flight context for any new account the same way `scan` does.
3. Update the saved file.

### brief

Run so delivery lands before `<brief-deadline>`. When there are no qualifying meetings, stay quiet.

1. **Gather**, for each meeting:
   - Notes or transcripts from the last two or three meetings with the same account or attendees: decisions, open actions, owners.
   - The account's chat channels from the last 7 to 10 days.
   - Every ticket key mentioned anywhere: current status, linked pull request (merged or open), last update.
   - A sweep of the account's tickets updated or resolved since the last meeting, so shipped work nobody mentioned still appears.
   - The saved in-flight context, plus the private operations record's client folder when one exists ([`client-brief`](../client-brief/SKILL.md) step 1).
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
4. **Deliver** in the person's chat only. Keep it warm, brief, and easy to skim.

## Post-meeting mode

### proposals

Run through the working day. Each run handles meetings that have ended and are not in the processed log.

1. **Organiser only.** Produce proposals only when the person is the meeting's organiser. When the person is not the organiser, record the meeting as skipped in the processed log and move on.
2. **Get the record.** Read the transcript from the meeting transcript tool. When there is none after `<transcript-grace>`, ask the person once for their notes or a short summary, record that you asked, and wait for their reply before going further.
3. **Draft numbered proposals.** Each proposal is one change to one ticket: create a ticket, enhance a ticket, add a comment that records a decided outcome, or change one named field. Draft created and enhanced tickets in the shape [conventions/ticket-content.md](../../conventions/ticket-content.md) locks, and follow the [`ticket`](../ticket/SKILL.md) playbook's rules. Each proposal carries:
   - The evidence: a short quote or paraphrase from the transcript with its local time.
   - The ticket key linked under `<tracker-host>`, or the project for a new ticket.
4. **Add the rest** after the numbered proposals:
   - Actions that are not tickets, with owner.
   - What the client owes.
   - Anything ambiguous, as a question to the person.
5. **Ask for approval** in the person's chat, with a way to approve each number, change it, or drop it.
6. **Apply only what was approved.** Use the ticket tool the runner already has. A field a person triages (status, assignee, priority) changes only when the approved proposal names that exact change. Fetch each ticket once afterwards and check it rendered. Report the keys and what changed.
7. **Log it.** Add one line per meeting to the processed log in `<state-dir>`: date, local start time, title, and outcome (proposed, approved and applied, skipped as not organiser, notes requested).

## Stop

The playbook is complete for a run when each qualifying meeting has a saved context entry (`scan`, `recheck`), a delivered brief (`brief`), or a processed log line (`proposals`), or when a required setting or source was missing and that was stated. It is not complete if a point was invented, an owed action was listed without checking its ticket, the person was named in their own brief, anything was sent outside the person's chat, or a ticket change was applied without the person's own approval.
