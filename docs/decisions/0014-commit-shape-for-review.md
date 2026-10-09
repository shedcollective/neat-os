# 0014 — Commits are one concern, explained, and ordered for review

**Status:** Accepted
**Date:** 2026-10-01

## Context

An issue recorded in the archive repository locked one reason per commit in [conventions/git.md](../../conventions/git.md), with "where possible" so a commit still stands on its own. Reviewers still met one commit at the end of a piece of work. The message did not have to say why, the commits had no required order, and documentation could land after the code or inside the same commit. A later issue recorded in the archive repository asks for small commits, a message that says what changed and why, one concern, an order a reviewer can follow, and documentation as the first commit when the work includes it.

## Decision

Commit shape stays in [conventions/git.md](../../conventions/git.md). Each commit is one concern. The message says what changed and why. When several commits record one piece of work, they are ordered so a reviewer can follow the change from the first commit to the last. When the work includes documentation, that documentation is the first commit. After that, a commit comes before the commits that depend on it. Do not split so thinly that an intermediate commit does not stand on its own. Stacked pull requests still split review. They do not put each commit in its own pull request. `scripts/check-structure.js` asserts those sentences stay in `conventions/git.md`. The policy list in `scripts/check-policy.js` is already at its cap of 10, so this check is structural.

## Consequences

An agent that finishes a piece of work records it as several commits instead of one commit that holds the whole change. A change that is only documentation is that one first commit. History is longer, and each commit still stands on its own. The "where possible" wording from that earlier issue is now a requirement, with the thin-split guard kept. "One reason to change" and "one concern" are the same rule. The convention uses "one concern".
