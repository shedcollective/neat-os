---
name: design-handoff
description: >-
  Bundle a chosen option as a Figma link, PNGs, spec.md, and open decisions
  into the private operations record by pull request. Code work goes out as a
  ticket via the ticket playbook. Mirror engineer build decisions back into
  Figma this run owns.
---

# design-handoff

Hand a chosen option to engineering and to the private record. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

## When to use

- An option has been chosen, by the asker or on the agent's recommendation, and the asker wants a handoff bundle.

## When not to use

- No option has been chosen yet (that is [`mockup`](../mockup/SKILL.md) or [`naming-and-voice`](../naming-and-voice/SKILL.md)).
- Writing the implementation. Code goes through [`ticket`](../ticket/SKILL.md), never as a code pull request from this agent.
- Editing a client-owned Figma file without the asker's say-so for that file.

## Steps

1. Collect the Figma link, the self-checked PNGs, a `spec.md`, and the open decisions. Set any new Figma file's name at creation; the connector cannot rename it.
2. Save the bundle to `<ops-record>` under `design/<brand>/handoffs/YYYY-MM-DD-<slug>/` by pull request only. Put open decisions on `design/<brand>/open.md` the same way.
3. If engineering must build from the spec, create the ticket with [`ticket`](../ticket/SKILL.md). The shape is [conventions/ticket-content.md](../../conventions/ticket-content.md). Do not invent a second ticket shape. Do not write code, open a code pull request, or merge.
4. When an engineer records a build decision, mirror it back into a Figma file this run owns. Not into a client-owned file unless the asker says so for that file ([Client-owned Figma files](../../conventions/design-ux-agents.md#client-owned-figma-files)).

## Stop

Complete when the pull request to the private record exists and, if code is needed, the ticket exists. Not complete if a code pull request was opened, or a client-owned file was edited without the asker's say-so for that file.
