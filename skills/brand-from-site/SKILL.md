---
name: brand-from-site
description: >-
  Capture a live public website's brand foundations into a new Figma file.
  Colour, type, spacing, logo and imagery notes, and key UI as a snapshot.
  Flag unknowns. Never publish a library or edit an existing file.
---

# brand-from-site

Read a public website and put what you can see into a **new** Figma file. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

A teammate may already have a version of this playbook. If they point at one, use theirs and stop.

## When to use

- The asker wants a first-pass brand file from a public site, before a designer takes over.

## When not to use

- The site needs a login, or is not public.
- Updating an existing Figma file or publishing a library (a director approves that; this playbook does not do it).
- Checking a built page against frames (that is [`design-qa`](../design-qa/SKILL.md)).

## Steps

1. Take the public URL from the asker. Stop if it needs a login.
2. Ask whether a teammate already captured this brand. If a file exists and the asker does not want a fresh draft, stop and point at it.
3. Read the live site from the asker's own connectors. Capture colour, type, spacing, logo and imagery notes, and key UI components as a snapshot. Flag unknowns. Do not invent tokens ([never-invent-facts](../../principles/never-invent-facts.md)).
4. Create a **new** Figma file. Never edit an existing file. Never publish a library.
5. Deliver the file link to the asker. Do not send it to a client.

## Stop

Complete when the new Figma file exists and the asker has the link, or when the run stopped because a teammate's file already covers it. Not complete if an existing file was edited, a library was published, or a guess was written as a token.
