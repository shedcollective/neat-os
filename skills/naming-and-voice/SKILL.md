---
name: naming-and-voice
description: >-
  Propose 2 to 3 naming options with a rationale, clash and domain checks,
  and tone-of-voice drafts with do and do not examples. The agent recommends one.
  Chosen options go in design/<brand>/locked.md by pull request.
---

# naming-and-voice

Turn a filled intake card into naming and tone-of-voice options. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## When to use

- The intake card is filled and the asker wants naming options, tone of voice, or both.

## When not to use

- The intake card is missing (that is [`design-brief`](../design-brief/SKILL.md)).
- Locking a visual mockup (that is [`mockup`](../mockup/SKILL.md)).
- Writing code or opening a product-repository pull request.

## Steps

1. Read the intake card.
2. Propose 2 to 3 naming options. Each option has a rationale, a clash check, and a domain check. Flag anything unverified. Do not invent that a name is free ([never-invent-facts](../../principles/never-invent-facts.md)).
3. Draft tone of voice with do and do not examples. Show the options, and say which one it would pick and why.
4. The asker reviews the options. When the asker does not choose, proceed on the recommendation and say so. Do not send anything to a client.
5. Write the chosen options to `design/<brand>/locked.md` by pull request.

## Stop

Complete when 2 to 3 options are in the reply, or when a chosen option has a pull request to `locked.md`. Not complete if a name was declared free without a check.
