---
name: mockup
description: >-
  Turn a filled design-brief into 2 to 3 Figma options built from the brand
  kit and the asker's references. Shape the layout with EXAMPLE DATA,
  then real data. Deliver every option with self-checked PNG screenshots.
  Recommend one. Edit a client-owned file only on the asker's say-so.
---

# mockup

Turn a filled intake card into 2 to 3 Figma options. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## When to use

- The intake card is filled and the asker wants mockup options.

## When not to use

- The intake card is missing (that is [`design-brief`](../design-brief/SKILL.md)).
- Capturing a brand from a live site (that is [`brand-from-site`](../brand-from-site/SKILL.md)).
- Journeys, flows, wireframes, or WCAG (that is the UX agent).
- Writing code or opening a product-repository pull request.

## Steps

1. Read the intake card. Stop if the brand kit or references are missing (that is [`design-brief`](../design-brief/SKILL.md) step 2).
2. Build each option from the brand kit and the references on the card, and say what it takes from which reference. Question these defaults before using one: a small eyebrow label above a heading, decorative circle markers, and a stock hero layout. They are not banned. Keep one only when a supplied reference or a clear purpose justifies it, and say which.
3. Shape the layout with `EXAMPLE DATA`. Then replace it with real data the asker supplied. Label anything still guessed as `EXAMPLE DATA` or unverified. Do not invent copy or figures ([never-invent-facts](../../principles/never-invent-facts.md)).
4. Create a **new** Figma file, or draft in a file this run created. Set the file name at creation. The Figma connector cannot rename a file. Do not edit a client-owned file unless the card records the asker's explicit say-so for that file. Then work on a duplicated page or a branch and log what changed ([Client-owned Figma files](../../conventions/design-ux-agents.md#client-owned-figma-files)). Never publish a library.
5. Produce 2 to 3 options. Recommend one and say why. The asker reviews them. When the asker does not choose, proceed on the recommendation and say so. Do not send anything to a client.
6. Export PNGs. Connector screenshots cap at 1024px; do not treat those as full-resolution proof. Self-check every PNG for overlaps, clipping, 8px grid alignment, and laptop readability before handover. Deliver every option with its PNG screenshots, its Figma link, and links to the references it uses. A Figma link alone is not a delivery.

## Stop

Complete when 2 to 3 options exist, every PNG has been self-checked, and the asker has the screenshots, the file link, and the reference links for each option. Not complete if a client-owned file was edited without the asker's say-so for that file, a library was published, guessed data was written as real, or an option arrived without its screenshots.
