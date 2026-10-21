---
name: design-qa
description: >-
  Compare a built page against its Figma frames. List visual diffs with
  screenshots. Comment only. Never edit the page, the frames, or a ticket's
  status. Belongs to the assurance role. Reads the same tokens.json source.
---

# design-qa

Compare one built page to the Figma frames it should match. This playbook belongs to the **assurance** role, not the design agent. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## When to use

- The asker wants a visual-diff list for a built URL against named Figma frames.

## When not to use

- Capturing a brand from a live site (that is [`brand-from-site`](../brand-from-site/SKILL.md)).
- A heuristic or accessibility audit (that is [`ux-audit`](../ux-audit/SKILL.md)).
- Editing the page, the frames, or a ticket's status.

## Steps

1. Take the built page URL and the Figma frames from the asker. If the product repository names a design system in `.agents/project.md`, read those links, including the shared token source `tokens.json`. If the frames are still unknown, ask once and stop. Use the asker's own connectors only. A guest seat gets few calls a month; say so if the run needs many reads.
2. Open the built page and the frames. Connector screenshots cap at 1024px; do not treat those as full-resolution proof.
3. List visual diffs. Each finding has a screenshot, the frame it is against, and a one-line description. Flag unknowns. Do not invent a spec.
4. Comment on the ticket or pull request. Do not edit the page, the frames, a live library, or a ticket's status. Do not send the comment to a client.

## Stop

Complete when the comment is posted, or when the frames could not be found and that was stated. Not complete if anything live was edited.
