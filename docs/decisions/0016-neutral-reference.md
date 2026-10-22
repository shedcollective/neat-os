# 0016 — The public tree is a neutral reference

**Status:** Partially superseded by 0023
**Date:** 2026-10-08

## Context

This repository will be public. A reader who has only the repository should not learn who works on it or which clients it has served. Pages, examples, and commit text had collected those names, and ticket keys from product work. A principle is the wrong place for the rule. The principle set is capped at twelve ([0011](0011-principle-set-cap-twelve.md)). The policy list in `scripts/check-policy.js` is already at its cap of ten, so the check is its own script ([encode-lessons-in-structure](../../principles/encode-lessons-in-structure.md)). The change is recorded in the archive repository.

## Decision

The repository names roles, not people, and it does not name clients, projects, products, or bots. The rule is [conventions/neutral-reference.md](../../conventions/neutral-reference.md). `scripts/check-neutral.js` enforces the part software can see, including the pull request body and the commit messages when CI has a pull request context. A fact about one product repository stays in that repository's `.agents/project.md`, or in the agent's own configuration. This repository may still cite its own `GH-<n>` and `#<n>`, and the publisher scope `@shedcollective/shed-os` until the rename at 0.4.0.

## Consequences

A later edit that names a person, a client, or a bot fails the required check. History already on `develop` stays as it is. A rewrite waits for 0.4.0. The assurance playbook is left for the pull request that is already rewriting it. If the check flags that file, this branch stays red until that pull request is on `develop` and `develop` is merged here.

A specific-name denylist was considered and deferred, and will be revisited if leaks start to appear.
