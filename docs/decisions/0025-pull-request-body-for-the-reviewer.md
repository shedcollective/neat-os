# 0025 — A pull request body states the change a reviewer accepts

**Status:** Accepted
**Date:** 2026-11-06

## Context

Pull request bodies grew a fixed briefing: what changed, why, rule identifiers, consumers, deferred work, and a review list. The writing convention asked for a short briefing of what changed, why, and how it was verified, as rule 10 of [conventions/writing.md](../../conventions/writing.md), locked with [ADR-0009](0009-writing-convention.md). In practice that briefing repeated itself, and the decision a reviewer is asked to accept was hard to find. [Issue #77](https://github.com/shedcollective/neat-os/issues/77) records the outcome. Three public notes informed the shape. They are not rules. A file recap does not help a reviewer ([napari contributing guide](https://napari.org/stable/developers/contributing/ai.html)). A description should say why, what the result is, and show it ([notes on pull request descriptions](https://www.justindfuller.com/programming/better-pull-request-descriptions)). A human summary should stay apart from the detail ([notes on a human summary](https://blog.leadingedje.com/post/ai-tldr.html)).

## Decision

A pull request body states the practical change and why a reviewer should accept it, in plain sentences, before any reference notes. The shape is locked in [conventions/writing.md](../../conventions/writing.md#pull-request-bodies). The pull request template points at that section and does not restate it. It keeps the neutrality checkbox from [conventions/neutral-reference.md](../../conventions/neutral-reference.md). A before and after is included only when it shows the change. A decision is named only when there is one. Evidence names what was verified and what was not. A compiler finishing, or a type check passing, does not show that two behaviours are the same. Rule identifiers, rationale, consumer impact, references, and deferred work stay in one collapsed reference when they exist. The summary does not hide a risk and does not contradict the detail. One pull request is one coherent change. Commit subjects and pull request titles stay as [conventions/git.md](../../conventions/git.md) and [conventions/tickets.md](../../conventions/tickets.md) lock them. The policy list in `scripts/check-policy.js` stays at 10. This shape is review, not a new check. It serves the aim in [PURPOSE.md](../../PURPOSE.md) that a person can trust the work without rereading every line.

## Consequences

[ADR-0009](0009-writing-convention.md) stays Accepted. Its public-reader rules and the checked subset are unchanged. The sentence that a pull request body is a briefing of what changed, why, and how it was verified is replaced by the section above. Product repositories pick up the convention when they move their neat-os pin. `init` does not copy `.github/pull_request_template.md`, so that file applies to this repository. The assurance evidence pack stays a comment on a pull request, not the body, and this decision does not change it. No playbook required a conflicting body, so none was edited. No open pull request is rewritten. Rules for code comments are unchanged.
