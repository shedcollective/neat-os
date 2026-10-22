# 0023 — Credit a commit to the person who drove the session

**Status:** Accepted
**Date:** 2026-10-22

## Context

[Issue #38](https://github.com/shedcollective/neat-os/issues/38) recorded that agent commits used a shared author whose GitHub noreply address credits an unrelated account. On 22 October 2026 the repository owner decided against a shared author. The person who drove the agent session is the author, using their own GitHub noreply address in the form `<id>+<login>@users.noreply.github.com`. A co-author trailer is not used. [ADR-0016](0016-neutral-reference.md) had also forbidden personal names in this public tree. That part no longer matches the decision. Client names, client projects, and internal chat stay out of this repository.

## Decision

The git author is the person who drove the session. On each clone, set `user.name` and `user.email` to that person before committing. The email is `<id>+<login>@users.noreply.github.com`. Do not add a co-author trailer. Point `core.hooksPath` at a hooks directory that has no platform co-author `commit-msg` hook.

The neutral rule only keeps client names, client projects, and internal or Slack chatter out of this repository. It does not forbid a personal name, authorship, or a team member's GitHub login.

`scripts/check-neutral.js` enforces the part software can see, including author and committer email on commits in a pull request range. The policy list in `scripts/check-policy.js` stays at its cap of ten, so this check is an extension of the neutral script, not a new policy. History already on `develop`, `main`, and tags is not rewritten.

The rules are [conventions/attribution.md](../../conventions/attribution.md) and [conventions/neutral-reference.md](../../conventions/neutral-reference.md).

## Consequences

[ADR-0016](0016-neutral-reference.md) is partially superseded. The part that said the repository names roles, not people, and that it does not name products or bots, is replaced. The part that keeps client facts and internal chatter out, and the check that scans the tree and the pull request, still holds. A commit whose author is a shared noreply identity fails the check on the next pull request. Old commits stay.

This replaces the open design on issue #38 that asked for one shared bot identity. There is no shared author.
