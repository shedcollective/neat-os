---
name: ux-audit
description: >-
  Heuristic and accessibility review of a user's whole flow. Ranked findings,
  each with a named principle and an evidence label. Report only. Never edit
  the site or change a ticket's status.
---

# ux-audit

Review one public URL or named flow. Follow [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

## When to use

- The asker wants a ranked heuristic and accessibility review of a URL or flow.

## When not to use

- Visual diffs against Figma frames (that is [`design-qa`](../design-qa/SKILL.md)).
- Synthesising interview notes (that is [`research-synthesis`](../research-synthesis/SKILL.md)).
- Building an IA package or clickable wireframe (that is [`wireframes`](../wireframes/SKILL.md)).
- Fixing the site.

## Steps

1. Take the URL or flow, and the user and task it serves, from the asker. Ask once if the user or task is missing, and state that limit in the report. Stop if it needs a login the asker has not granted on their own connectors.
2. Review the whole task, not isolated pages: every step, the shared components, the empty, error and loading states, and whether names stay the same from step to step. Check accessibility basics (keyboard, labels, contrast, names and roles) at desktop and phone widths. Check unit identity: buttons do actions and links go places, filters do not look like tags, and a static box does not look like a card.
3. Each finding names and links what it rests on. For an accessibility finding, that is a WCAG reference. Otherwise it is a principle from the [Laws of UX index](https://lawsofux.com/llms.txt). Fetch a principle's page, with `Accept: text/markdown`, only when its takeaways are needed. Link to it; do not copy its text. A psychology principle is not an accessibility standard. If none fits, say so. Do not invent a connection.
4. Label each finding `heuristic (untested)` or `evidenced`. `evidenced` names its source: analytics, session recordings, or user testing. Keep a screenshot or reproduction step with every finding, but those show where a problem is, not that users are affected. Never call a finding validated without that evidence. Rank findings. Flag unknowns. Do not invent a failure.
5. Close the report with the data that would test each `heuristic (untested)` finding, and the limits of the review.
6. Write a new draft report, or a comment on the ticket. Do not edit the site, a Figma file, or a ticket's status. Do not send the report to a client.

## Stop

Complete when the report or comment is delivered to the asker. Not complete if the site was edited, a finding was guessed, a finding has no principle or WCAG reference and does not say none fits, or a finding is called validated without evidence.
