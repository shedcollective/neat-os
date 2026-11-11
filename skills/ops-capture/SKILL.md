---
name: ops-capture
description: >-
  Event or frequent-sweep job: capture new client email, client and shared
  Slack threads, applied meeting proposals, and decisions a director states
  into the private operations record as small idempotent commits. Owned by the
  operations lead.
---

# ops-capture

Capture operations events into `<ops-record>` when they happen, instead of waiting for the end-of-day run. Each event becomes one small commit that appends a dated line to today's day file, to the client's log, and, when a decision was made, to a Proposed decision file. The run is **idempotent**: a source item already in the processed marker changes nothing. Apply [conventions/agent-work-logging.md](../../conventions/agent-work-logging.md).

The **operations lead** owns this playbook. [`daily-burndown`](../daily-burndown/SKILL.md) consolidates what this run captured and does not rediscover it. Why events are captured as they happen: [ADR-0026](../../docs/decisions/0026-capture-operations-events-as-they-happen.md).

A team bot does not run this routine without a filled bot passport ([docs/team-setup.md](../../docs/team-setup.md#team-bots)).

## When to use

- A frequent routine sweeps the working day for new operations events.
- An event arrives that the routine is set to react to: a new client email thread, a new message in a client or shared Slack thread, a `meeting-prep` proposal that was just applied, or a director stating a decision.
- The operations lead asks to capture a named email, thread, meeting or decision now.

## When not to use

- Writing the end-of-day shared body or refreshing the in-flight board (that is [`daily-burndown`](../daily-burndown/SKILL.md)).
- Recording a bid (that is [`bids-register`](../bids-register/SKILL.md)).
- Changing a client profile, accepting or editing a decision, or editing a bot passport. Those stay a pull request a director merges.
- Replying to, forwarding or posting about any event.

## Settings

The routine supplies the shared names in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<ops-record>`, `<timezone>`, `<connectors>`, `<write-rule>`, and `<quiet-when-empty>`. `<write-rule>` for this playbook is commit to the default branch of `<ops-record>` for the paths in [Writes](#writes) only. If a required setting is missing, ask once and stop.

These settings belong to this playbook and are filled by the passport or wrapper. They are never defaults in neat-os:

| Setting | Required | Meaning |
| --- | --- | --- |
| `<capture-mode>` | yes | `sweep` reads every source for items since the last captured item today. `event` captures the one item the trigger names. |
| `<directors>` | yes | The people whose stated decisions are recorded. Names or roles, never bots. |
| `<capture-marker>` | no | Processed marker in `<ops-record>`. Default `capture/YYYY/MM/processed.md`. |
| `<day-path>` | no | Day file path. Default `burndown/YYYY/MM/YYYY-MM-DD.md`, the same path `daily-burndown` writes. |
| `<client-root>` | no | Client folders. Default `clients/`. A client is matched through its `profile.md` (email domains, chat channels, tracker project). |
| `<decisions-root>` | no | Decision files. Default `decisions/`. |
| `<meeting-marker>` | no | The shared processed marker `meeting-prep` writes, when the record has one. |

## Sources

Read only `<connectors>`, which are always the asker's own accounts. Never another person's mail, calendar, chat or direct messages.

| Event | Source id | Captured when |
| --- | --- | --- |
| Client email thread | the mailbox message id | A new message in a thread whose sender or recipients match a client's email domains. |
| Client or shared Slack thread | channel plus thread timestamp plus message timestamp | A new message in a channel listed in a client profile, an external client channel, or an agreed team channel discussing a client project. |
| Applied meeting proposals | the meeting id, or the calendar event id | `<meeting-marker>` records the meeting as applied and this marker does not list it yet. |
| Director decision | the source id of the message, thread message or meeting it was stated in | A person in `<directors>` states a decision in chat, Slack or a meeting. |

A **decision** is a clear statement by a person in `<directors>` that the agency will or will not do something ("we will", "we have decided", "agreed: ..."). A question, an option, a preference or another person's suggestion is not a decision. When it is unclear, capture the line as ordinary activity and do not write a decision file.

## Writes

Each captured event may write these paths in `<ops-record>`, and nothing else:

1. **Today's day file** at `<day-path>`. Append one line under the project section and the activity heading that fits (`#### Email`, `#### Slack`, `#### Meetings / notes`), in the shape [`daily-burndown`](../daily-burndown/SKILL.md#day-shape) uses. A decision also gets a line under `#### Notable` in `### Agency state`. When the file is absent, create the shared body skeleton from [templates/ops/burndown-day.md](../../templates/ops/burndown-day.md), or from the passport's Day file table: the title, the timezone line, `### Agency state`, and `### Sources unavailable`, with no placeholder bullets. Add a missing project section before `### Agency`. **Never overwrite, reorder or delete another owner's lines.** Work that matches no client goes under `### Agency` only when it is clearly work.
2. **The client log** at `<client-root>/<slug>/log.md`. Append one dated line under its events heading (create `## Events` when there is none) for a new work contact (name and role), an agreement (scope, signature, renewal date), a purchase order (received, with its reference), or a decision that affects that client. Ordinary correspondence goes in the day file only. Write to a client log only when that client folder already exists. Never create a client folder or edit `profile.md`.
3. **A decision file**, when a decision was made, per [Decision rule](#decision-rule).
4. **The processed marker** at `<capture-marker>`. One line per source id: `- <source id> | YYYY-MM-DD HH:MM | <event kind> | <client slug or agency> | <paths written, or skipped and why>`. Add a line for a skipped item too, so a re-run does not look at it again.

Line shapes:

```
Day file:   - HH:MM <one-sentence work fact>. (<event kind>)
Client log: - YYYY-MM-DD <contact | agreement | purchase order | decision>: <fact>. Source: <event kind>, <link or source id>.
```

Times are in `<timezone>`.

## Decision rule

A decision a person in `<directors>` states in chat, Slack or a meeting is written to `<decisions-root>YYYY-MM-DD-<slug>.md` in the record's own decision template, with **Status Proposed** and a source link, and committed straight to the default branch.

- `YYYY-MM-DD` is the date it was stated, in `<timezone>`. `<slug>` is the decision in a few lowercase words, hyphenated.
- **Who** names the director who stated it. **Source** links the message, thread or meeting record. Context and Decision summarise the statement. Do not paste chat, meeting notes or email.
- When a decision replaces an earlier one, name the earlier file under **Replaces**. Do not edit the earlier file.
- When the path already exists for a different source id, append `-2`, then `-3`. When it exists for the same source id, skip.
- Changing Status to Accepted or Superseded, and any edit to a decision file once written, stays a **pull request a director merges**. This run never sets Accepted and never edits an existing decision file.

## Hard rules

- **Idempotent.** Before writing, look up the source id in `<capture-marker>`. A listed id is skipped. Re-running over the same sources makes no commit.
- **One event, one commit.** The commit holds that event's day line, client log line, decision file, and marker line, and nothing else. Commit straight to the default branch. Never rewrite history. If the push is rejected because the branch moved, fetch, replay the one unpushed commit on the latest default branch, check the marker again, and retry once. Then stop and say so.
- **Work only** ([agent-work-logging.md](../../conventions/agent-work-logging.md)). Drop personal chatter, health, family, home and personal finance. A direct message is captured only when it is clearly work, as a short summary.
- **No amounts.** Never write amounts, rates, totals, VAT or line items into a day file, a client log or a decision file.
- **No secrets** ([never-store-secrets.md](../../conventions/never-store-secrets.md)): no tokens, passwords, portal logins or private URLs with credentials.
- **No personal data** beyond a work contact's name and role.
- **The asker's connectors only.** Never read another person's connectors.
- Do not invent a fact, a client match, a decision or a date ([never-invent-facts](../../principles/never-invent-facts.md)). When the source cannot be read, add it under `### Sources unavailable` and capture nothing from it.
- **Never reply, send, forward or post.** This run writes to `<ops-record>` only.
- Do not name bots in the record ([conventions/writing.md](../../conventions/writing.md)). British English, one fact per line.

## Steps

1. Confirm the settings. If a required setting is missing, ask once and stop. If a team bot is running this, confirm a filled bot passport names `ops-capture` and stop if it does not.
2. Confirm `<ops-record>` and pull the latest default branch. Stop if it is missing.
3. Read `<capture-marker>` for this month (and last month's, near a month end).
4. Collect candidate items from `<connectors>` per [Sources](#sources). In `sweep` mode, read items since the last captured item today, in `<timezone>`. In `event` mode, read the one item the trigger names.
5. For each item, oldest first:
   1. Skip it when its source id is in the marker.
   2. Drop it when it is not work. Add a marker line that says skipped, without the content.
   3. Match the client through `<client-root>` profiles. When no single client matches, treat it as agency work and write no client log.
   4. Decide which of the [Writes](#writes) apply. Strip amounts, secrets and personal data.
   5. Re-read the day file and the client log just before writing, then append. Write the decision file when the [Decision rule](#decision-rule) applies.
   6. Add the marker line and commit this event alone, with a message such as `capture: <client slug or agency> <event kind> YYYY-MM-DD`.
6. If nothing was captured, follow `<quiet-when-empty>` and make no commit.
7. Report to the asker how many events were captured, which decision files were written as Proposed, and any source that was unavailable.

## Stop

Complete when every new item from the named sources is captured or marked skipped, each in its own commit, or when nothing was new and the run made no commit, or when a required setting, record or source was missing and that was stated. Not complete if amounts, secrets, personal material or invented facts were written, if another person's connectors were read, if another owner's line was overwritten, if a decision was set to Accepted or an existing decision file was edited, if a repeat run wrote a listed source id again, if anything was sent or posted, or if history was rewritten.
