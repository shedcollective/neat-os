---
name: naming-and-voice
description: >-
  Propose 2 to 3 naming options with a rationale, clash and domain checks,
  and tone-of-voice drafts with do and do not examples. The lock owner picks.
  Locked choices go in design/<brand>/locked.md by pull request.
---

# naming-and-voice

Turn a filled intake card into naming and tone-of-voice options. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

## When to use

- The intake card is filled and the asker wants naming options, tone of voice, or both, for a named lock owner to pick.

## When not to use

- The intake card is missing (that is [`design-brief`](../design-brief/SKILL.md)).
- Locking a visual mockup (that is [`mockup`](../mockup/SKILL.md)).
- Writing code or opening a product-repository pull request.

## Steps

1. Read the intake card. Stop if the lock owner is unnamed.
2. Propose 2 to 3 naming options. Each option has a rationale, a clash check, and a domain check. Flag anything unverified. Do not invent that a name is free ([never-invent-facts](../../principles/never-invent-facts.md)).
3. Draft tone of voice with do and do not examples. Show the options, and say which one it would pick and why.
4. Wait for the lock owner named on the brief. Do not send anything to a client.
5. When the lock owner picks, write the locked choices to `design/<brand>/locked.md` by pull request. If the brief is confidential, record a link and the decision titles only.

## Stop

Complete when 2 to 3 options are in the reply, or when a locked choice has a pull request to `locked.md`. Not complete if a name was declared free without a check, or if confidential content was copied into the record.
