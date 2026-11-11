# 0028 — Design options come from supplied references, and a new design playbook proves its difference

**Status:** Accepted
**Date:** 2026-11-10

## Context

The design agent's intake card named a brand and sources, but not the brand kit or the reference designs the lock owner wanted to draw on. Without them, options fall back on the model's own defaults, such as small eyebrow labels above headings, decorative circle markers, and stock hero layouts. Options could also be handed over as a Figma link alone, although `mockup` already exports and self-checks PNGs. [Issue #80](https://github.com/shedcollective/neat-os/issues/80) proposed tightening the existing workflow rather than adding a playbook. A [public discussion](https://news.ycombinator.com/item?id=50395747) of agent-made design prompted it.

## Decision

For a mockup, the `design-brief` intake card records the brand kit and the reference designs the lock owner picked, each with what to take from it. `None` counts only when the lock owner says so. `mockup` stops when they are missing, builds each option from them, and says what it takes from which reference. It treats eyebrow labels, decorative circle markers, and stock hero layouts as defaults to question, not bans: a supplied reference or a clear purpose can justify one. Every option is delivered with its self-checked PNG screenshots, its Figma link, and its reference links. A new design playbook is accepted only after a with-versus-without comparison on the same brief, brand kit and references, with screenshots of both and a short account of the differences, and a person decides whether it earns its place. The rules live in [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md). The steps live in [skills/design-brief/SKILL.md](../../skills/design-brief/SKILL.md) and [skills/mockup/SKILL.md](../../skills/mockup/SKILL.md).

## Consequences

A lock owner sees options grounded in sources they chose, and can judge each from its screenshots without opening Figma. A mockup can no longer start from a brief with no brand kit or references unless the lock owner says there are none, so intake asks one more question. The list of defaults is a prompt, not a lint, and nothing checks it automatically. The comparison rule adds work before a new design playbook lands, and does not apply retrospectively to existing playbooks. The lock owner still picks, and visual QA of a built page stays with the assurance role in `design-qa`. Design-system location and component mapping stay with [issue #27](https://github.com/shedcollective/neat-os/issues/27).
