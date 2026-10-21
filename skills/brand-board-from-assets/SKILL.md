---
name: brand-board-from-assets
description: >-
  Read PDF or AI brand assets through the asker's own connectors, extract a
  brand board into a new Figma file, and list open decisions. Never edit a
  client-owned file or publish a library.
---

# brand-board-from-assets

Turn supplied brand assets into a first-pass board and an open-decisions list. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## When to use

- The intake card is filled and the asker has PDF or AI brand assets to extract.

## When not to use

- The intake card is missing (that is [`design-brief`](../design-brief/SKILL.md)).
- Capturing a brand from a live public site with no assets (that is [`brand-from-site`](../brand-from-site/SKILL.md)).
- Guessing tokens the assets do not show.

## Steps

1. Read the PDF or AI assets through the asker's own connectors. If the brief is confidential, follow the client-confidential rule in the convention. Stop if the assets are missing.
2. Extract what the assets show: colour, type, spacing, logo, and imagery notes. Flag unknowns. Do not invent tokens ([never-invent-facts](../../principles/never-invent-facts.md)).
3. Create a **new** Figma file. Set the file name at creation. The Figma connector cannot rename a file. Never edit a client-owned file. Never publish a library.
4. List open decisions. Write them to the reply, and to `design/<brand>/open.md` by pull request. If the brief is confidential, record a link and the decision titles only.

## Stop

Complete when the new Figma file exists and the open-decisions list is in the reply. Not complete if a client-owned file was edited, a library was published, or a guess was written as a token.
