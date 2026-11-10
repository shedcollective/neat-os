# 0026 — Operations events are captured as they happen, and a stated decision is recorded as Proposed

**Status:** Accepted
**Date:** 2026-11-10

## Context

The private operations record was written at fixed times only. The end-of-day [`daily-burndown`](../../skills/daily-burndown/SKILL.md) rediscovered the whole day from the connectors. A client email reached the record as one line in that evening's day file, and the client folder did not change. No playbook wrote a decision, and the record's decisions folder needed a pull request a director merges, so a decision a director stated in chat, Slack or a meeting was never drafted. [`bids-register`](../../skills/bids-register/SKILL.md) ran once a day and tracked submitted bids only, so a bid submitted after the run, or still being worked on, was missing. [Issue #81](https://github.com/shedcollective/neat-os/issues/81) records the gaps and the proposal.

## Decision

Capture operations events when they happen. The [`ops-capture`](../../skills/ops-capture/SKILL.md) playbook runs on an event or as a frequent sweep through the working day. For each event it makes one small idempotent commit that appends a dated line to the day file, to the client's log, and, when a decision was made, to a decision file. It dedupes by source id through a processed marker, so a re-run changes nothing. `daily-burndown` consolidates the captured lines and does not rediscover them. A decision a director states is written to `decisions/YYYY-MM-DD-<slug>.md` in the operations record with Status Proposed and a source link, and committed straight to the default branch. Accepting, superseding or editing a decision stays a pull request a director merges. `bids-register` also runs when the bid-running agent reports a submission or an outcome, sweeps for outcomes weekly, records a Stage from pursuing to an outcome, and checks for a duplicate by buyer plus reference before it adds a row. This serves the aim in [PURPOSE.md](../../PURPOSE.md) that a team bot produces a record a person can trust without rereading every line.

## Consequences

The record is current during the day, not only after the evening run. A director sees a decision as a Proposed file within the hour and accepts it by merging a pull request, so the human gate on what the agency has decided is unchanged. A Proposed decision file on the default branch is a draft, not a decision: a reader must check its Status. The operations record receives many small commits instead of one a day. Each is one event and is easy to revert. The processed marker becomes a file the capture run and `daily-burndown` both read, so a corrupt or missing marker leads to duplicate lines, which the run reports rather than hides. Client logs gain contacts, agreements, purchase orders and decisions, never amounts. Live routines keep their pinned release until a release carries `ops-capture` and the bot passport names it ([ADR-0021](0021-wrapper-release-tag-pins.md)).
