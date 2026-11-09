# 0026 — Prose comments state current behaviour and the constraint

**Status:** Accepted
**Date:** 2026-11-06

## Context

[conventions/writing.md](../../conventions/writing.md) is the writing rule for code comments, commit messages, docs, and pull request titles and bodies ([ADR-0009](0009-writing-convention.md)). Its public-reader section tells the writer to point at a ticket key. That pointer is right for a commit and a pull request, where [conventions/git.md](../../conventions/git.md) and [conventions/tickets.md](../../conventions/tickets.md) already require the key. Read as a rule for prose comments, the same sentence puts ticket keys, pull request numbers, and branch or review narrative into the file. The next reader needs the behaviour that is true now and the constraint that makes it true. [Issue #74](https://github.com/shedcollective/neat-os/issues/74) records the clash.

A principle is the wrong place for the rule. The policy list in `scripts/check-policy.js` is at its cap of ten, and policy `written-for-a-reader-with-only-the-repo` does not parse code comments. A failing pattern cannot yet tell a causal constraint from a story. That warning is [issue #71](https://github.com/shedcollective/neat-os/issues/71), not this decision.

## Decision

Prose comments state current behaviour and the causal constraint. The rule is [conventions/code-comments.md](../../conventions/code-comments.md). Commit messages and pull requests still point at the ticket by key.

[ADR-0009](0009-writing-convention.md) stays Accepted. Its decision paragraph still holds: reader-facing pages are written for a developer who has only the repository, and policy `written-for-a-reader-with-only-the-repo` still checks the subset of [conventions/writing.md](../../conventions/writing.md) that software can see. This decision narrows the ticket-key sentence in the public-reader section so that it applies to commit messages and pull request text. It does not replace ADR-0009, and it does not add a principle or an eleventh policy.

A prose comment may point at open work only as `TODO(<issue-url>)`, at an external defect only as `bug(<url>)`, and at a blocked Nails package only with the temporary upstream patch form that page defines. Citations of a public standard or API contract, and compiler, typechecker, licence, and generated-file lines, are not change narrative. Temporal words that name a condition of the running system stay.

A responsibility header states what the file is for. When a change makes that statement false, the header and any guide sentence that states the same fact are updated in the same pull request ([keep-the-guide-true](../../principles/keep-the-guide-true.md)). There is no line cap. [ADR-0018](0018-no-numeric-principle-cap.md) records why a numeric cap is a poor lock.

When a change replaces a design, it restates the current design and removes the superseded path and the comments that described only that path. A revert follows the same rule. Nothing counts edits, and a second edit does not by itself require a rewrite.

`scripts/check-neutral.js` is unchanged.

## Consequences

Product repositories read the convention from the resolved neat-os tree when they move the pin. `init` does not overwrite an existing Agent Guide. [templates/AGENTS.md](../../templates/AGENTS.md) points new scaffolds at the convention. The Nails pack points at the temporary upstream patch form so the wording lives once.

[Issue #71](https://github.com/shedcollective/neat-os/issues/71), [issue #73](https://github.com/shedcollective/neat-os/issues/73), [issue #75](https://github.com/shedcollective/neat-os/issues/75), and [issue #72](https://github.com/shedcollective/neat-os/issues/72) stay open. They are checks and a playbook. [Issue #57](https://github.com/shedcollective/neat-os/issues/57) stays the feature-doc discussion. This decision does not publish a package and it does not tag a release.
