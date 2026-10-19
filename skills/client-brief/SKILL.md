---
name: client-brief
description: >-
  Assemble a high-level client brief from the private operations CRM and live
  connectors. No billing figures. Not a launch playbook.
---

# client-brief

Prepare a brief for a client call, a handoff, or onboarding someone to a client account. Read the private operations record's client folder and recent work digests. Add live context from the asker's connectors.

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os.

## When to use

- Preparing for a client call or writing a short written brief.
- Onboarding a teammate to a client account.

## When not to use

- Syncing accounting systems or writing invoice figures into the record.
- Filing a Jira Task (that is `ticket`).

## Steps

1. Resolve the client folder in the operations record (for example `clients/<slug>/profile.md` and `log.md`). If it is missing, say so and build from live sources only.
2. Read the profile and recent log. Pull in-flight work and recent burndown mentions for that client.
3. Add live context: open tickets, upcoming meetings, recent decisions, open questions. Link product `.agents/` paths when useful.
4. Write the brief:
   - **Who**: contacts and roles (no personal private notes).
   - **Agreement or scope**: high level, no rates.
   - **In flight**: owner and done when.
   - **Recent**: what moved.
   - **Risks, blockers, decisions needed**.
   - **Links**: tickets, repositories, decisions, `.agents/` paths.
5. Apply [agent-work-logging.md](../../conventions/agent-work-logging.md). Never include billing amounts, personal material, credentials, or bot names.
6. Deliver to the asker. Changes that would write into `clients/` follow that record's pull-request rules. External shares need asker approval.

## Stop

Complete when the brief is delivered, or when the client folder and live sources could not support a brief and that was stated.
