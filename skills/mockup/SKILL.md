---
name: mockup
description: >-
  Turn a filled design-brief into 2 to 3 Figma options. Shape the layout with
  EXAMPLE DATA, then real data. Self-check every PNG for overlaps, clipping,
  8px grid alignment, and laptop readability. Never edit a client-owned file.
---

# mockup

Turn a filled intake card into 2 to 3 Figma options. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## When to use

- The intake card is filled and the asker wants mockup options for a named lock owner to pick.

## When not to use

- The intake card is missing (that is [`design-brief`](../design-brief/SKILL.md)).
- Capturing a brand from a live site (that is [`brand-from-site`](../brand-from-site/SKILL.md)).
- Journeys, flows, wireframes, or WCAG (that is the UX agent).
- Writing code or opening a product-repository pull request.

## Steps

1. Read the intake card. Stop if the lock owner is unnamed.
2. Shape the layout with `EXAMPLE DATA`. Then replace it with real data the asker supplied. Label anything still guessed as `EXAMPLE DATA` or unverified. Do not invent copy or figures ([never-invent-facts](../../principles/never-invent-facts.md)).
3. Create a **new** Figma file, or draft in a file this run created. Set the file name at creation. The Figma connector cannot rename a file. Never edit a client-owned file. Never publish a library.
4. Produce 2 to 3 options. Say which one it would pick and why. Wait for the lock owner named on the brief. Do not send anything to a client.
5. Export PNGs. Connector screenshots cap at 1024px; do not treat those as full-resolution proof. Self-check every PNG for overlaps, clipping, 8px grid alignment, and laptop readability before handover.

## Stop

Complete when 2 to 3 options exist, every PNG has been self-checked, and the lock owner has the file link. Not complete if a client-owned file was edited, a library was published, or guessed data was written as real.
