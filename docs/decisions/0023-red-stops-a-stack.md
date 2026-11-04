# 0023 — Red stops the steps above it

**Status:** Accepted
**Date:** 2026-11-04

## Context

[red-is-a-stop](../../principles/red-is-a-stop.md) says nothing new is branched, stacked or merged onto red, and it names the integration branch. The Stacked PRs rule in [conventions/git.md](../../conventions/git.md) says a pending merge never blocks the next step, and it defines merge-ready as including CI green. It does not say what happens when a step goes red after the next step has started. [Issue #54](https://github.com/shedcollective/neat-os/issues/54) records the clash. A director approved the resolution below. [Issue #62](https://github.com/shedcollective/neat-os/issues/62) asks, among other open questions, what happens to a step that merged on green and later goes red. This decision answers that question. It does not decide the trust ramp.

## Decision

The two rules cover different kinds of waiting. Waiting on a person, such as a pending merge or review, never blocks. Red always does. Red on the integration branch remains the first task. [red-is-a-stop](../../principles/red-is-a-stop.md) covers the integration branch and any branch another step is stacked on. When any step in a stack goes red, the agent fixes that step before adding or rebasing any step above it. Steps below the red one are unaffected. A step that merged on green and later goes red counts as red on its target branch. `scripts/check-structure.js` asserts the sentences that state this in the principle, in the principle index, and in [conventions/git.md](../../conventions/git.md). The policy list in `scripts/check-policy.js` is already at its cap of 10, so this check is structural.

## Consequences

An agent with a green step may open the next step while the merge or the review is still pending. The same agent stops adding and rebasing above a step that goes red, and fixes that step first. A merge that was green does not stay green by history: if the target branch later fails a required check, that branch is red. Product repositories that pin `@shedcollective/neat-os` pick this up when they move the pin. No migration is required. [Issue #62](https://github.com/shedcollective/neat-os/issues/62) stays open for the trust ramp. Its question about a step that merged on green and later goes red is answered here.
