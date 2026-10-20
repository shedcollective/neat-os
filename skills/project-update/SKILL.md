---
name: project-update
description: >-
  Produce a short project status from the private operations record and live
  connectors. Link product .agents/ facts; do not invent them. Not a launch
  playbook.
---

# project-update

Write a crisp status for one project: what is in flight, what moved, what is blocked, and the next move. Read the private operations record and the asker's live connectors. Link the product repository's `.agents/` files; do not copy them into the update.

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os.

## Settings

The routine supplies these values, named as in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<ops-record>`, `<timezone>`, `<connectors>`, `<destination>`, and `<tracker-host>`. If a required setting is missing, ask once and stop.

## When to use

- Someone asks for a project update, status, or handoff for a named project.
- A routine needs a short status for a meeting.

## When not to use

- Creating or enhancing a Jira Task (that is `ticket`).
- Filling empty `.agents/` slots (that is `gather`).

## Steps

1. Name the project (and the client if distinct). If the tracking surface is unclear, say so ([never-invent-facts](../../principles/never-invent-facts.md)).
2. Read `<ops-record>`: in-flight board, recent burndown files, related decisions, and the thin client profile when present.
3. When the product repository is available, open `.agents/project.md` and related slots for facts `gather` already filled. Link; do not paste large copies.
4. Pull live deltas for the window asked (default: since the last burndown or the last five working days) from `<connectors>`: tickets, version control, channels, and meetings. Link ticket keys under `<tracker-host>`.
5. Write a short update:
   - **Now:** what is in flight (owner and done when).
   - **Moved:** what shipped or changed.
   - **Blocked or needs a decision:** with who should decide.
   - **Next:** concrete next moves.
6. Apply [agent-work-logging.md](../../conventions/agent-work-logging.md). No billing amounts, personal material, secrets, or bot names. British English ([writing.md](../../conventions/writing.md)).
7. Deliver to `<destination>` (default: the asker's chat). Do not post externally without approval ([keep-human-gates](../../principles/keep-human-gates.md)).

## Stop

Complete when the update is delivered, or when a required source was missing and that was stated.
