# 0027 — A UX finding names its principle and its evidence

**Status:** Accepted
**Date:** 2026-11-10

## Context

The `ux-audit` playbook asked for ranked findings with evidence, but evidence meant a screenshot or a reproduction step. A screenshot shows where a problem is. It does not show that users are affected, so a heuristic finding could read like a tested one. Findings also cited a WCAG reference or nothing, and the review could stop at isolated pages. [Issue #79](https://github.com/shedcollective/neat-os/issues/79) proposed a small change to the existing review rather than a new agent. A [public discussion](https://news.ycombinator.com/item?id=50395747) of a separate flow reviewer that cites Laws of UX, and of the limits of UX advice without observing people, prompted it.

## Decision

Every `ux-audit` finding names and links what it rests on: a WCAG reference for an accessibility finding, otherwise a principle from the public [Laws of UX index](https://lawsofux.com/llms.txt), or a plain statement that none fits. The index is linked, not copied, because its licence has not been checked. Every finding is labelled `heuristic (untested)` or `evidenced`, and `evidenced` names its source: analytics, session recordings, or user testing. No finding is called validated without that evidence. The report closes with the data that would test each untested finding and the limits of the review. The review covers the user's whole task: every step, shared components, empty, error and loading states, and consistent naming. The `wireframes` independent review reuses that whole-flow check. The steps live in [skills/ux-audit/SKILL.md](../../skills/ux-audit/SKILL.md). The beliefs behind them live in [conventions/design-ux-agents.md](../../conventions/design-ux-agents.md).

## Consequences

A reader can tell a tested finding from an expert judgement, and can follow each finding to its source. Reports get longer by one label and one link per finding, and by a closing list of missing data. An agent fetches a Laws of UX page only when it needs the takeaways. `research-synthesis` already requires a source for every quote, so it is unchanged. The audit stays report-only, human-driven, and behind the same human gates. A code-level accessibility review by the assurance agent is separate ([issue #47](https://github.com/shedcollective/neat-os/issues/47)).
