---
name: design-handoff
description: >-
  Hand a chosen option to engineering as a Jira ticket with the Figma link,
  PNGs, spec, and open decisions. Code work goes out as a ticket via the
  ticket playbook. Mirror engineer build decisions back into Figma this run
  owns.
---

# design-handoff

Hand a chosen option to engineering. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

## When to use

- An option has been chosen, by the asker or on the agent's recommendation, and the asker wants a handoff.

## When not to use

- No option has been chosen yet (that is [`mockup`](../mockup/SKILL.md) or [`naming-and-voice`](../naming-and-voice/SKILL.md)).
- Writing the implementation. Code goes through [`ticket`](../ticket/SKILL.md), never as a code pull request from this agent.
- Editing a client-owned Figma file without the asker's say-so for that file.

## Steps

1. Collect the Figma link, the self-checked PNGs, a short spec, and the open decisions. Set any new Figma file's name at creation; the connector cannot rename it.
2. Put that bundle on the Jira ticket: Figma links in the ticket, PNG or JPG exports as attachments, and the decided outcome in the ticket body via [`ticket`](../ticket/SKILL.md). The shape is [conventions/ticket-content.md](../../conventions/ticket-content.md). Do not invent a second ticket shape. If there is no ticket yet and engineering must build from the spec, create one with the asker's approval. If the connector cannot attach a file, name each file in the ticket and ask the asker to attach it.
3. Do not open a pull request to the private operations record for the handoff, locked choices, open decisions, or a Figma index. That history stays on the ticket and in Figma.
4. When an engineer records a build decision, mirror it back into a Figma file this run owns. Not into a client-owned file unless the asker says so for that file ([Client-owned Figma files](../../conventions/design-ux-agents.md#client-owned-figma-files)).

## Stop

Complete when the ticket carries the Figma link, the named or attached PNGs, and the decided spec. Not complete if a pull request was opened to the operations record, a code pull request was opened, or a client-owned file was edited without the asker's say-so for that file.
