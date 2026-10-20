---
name: ux-audit
description: >-
  Heuristic and accessibility review of a URL or flow. Ranked findings with
  evidence. Report only. Never edit the site or change a ticket's status.
---

# ux-audit

Review one public URL or named flow. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## When to use

- The asker wants a ranked heuristic and accessibility review of a URL or flow.

## When not to use

- Visual diffs against Figma frames (that is [`design-qa`](../design-qa/SKILL.md)).
- Synthesising interview notes (that is [`research-synthesis`](../research-synthesis/SKILL.md)).
- Building an IA package or clickable wireframe (that is [`wireframes`](../wireframes/SKILL.md)).
- Fixing the site.

## Steps

1. Take the URL or flow from the asker. Stop if it needs a login the asker has not granted on their own connectors.
2. Review against common heuristics and accessibility basics (keyboard, labels, contrast, names and roles) from what you can see. Check at desktop and phone widths. Check unit identity: buttons do actions and links go places, filters do not look like tags, and a static box does not look like a card. Rank findings. Each finding has evidence (screenshot or step) and, when it applies, a WCAG reference. Flag unknowns. Do not invent a failure.
3. Write a new draft report, or a comment on the ticket. Do not edit the site, a Figma file, or a ticket's status. Do not send the report to a client.

## Stop

Complete when the report or comment is delivered to the asker. Not complete if the site was edited or a finding was guessed.
