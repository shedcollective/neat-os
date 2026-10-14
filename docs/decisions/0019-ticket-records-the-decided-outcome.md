# 0019 — A ticket records only the decided outcome

**Status:** Accepted
**Date:** 2026-10-14

## Context

The ticket content convention required an Original request section: the ask in the requester's words, with who said it and when. Enhancing a ticket kept that text and placed the shaped sections after it. A ticket then carried the request, the discussion, and earlier drafts beside the outcome. A reader who opened only the ticket could not tell which text was the decision.

## Decision

A ticket must make sense in isolation. It records only the final decided outcome, stated as fact. It does not contain the original request text, meeting discussion, options considered, attributions, or a partial history of how the decision was reached. When a decision changes, the ticket body is rewritten to the new decision. History is not appended. The rule is in [conventions/ticket-content.md](../../conventions/ticket-content.md). The `ticket` playbook applies it. `scripts/check-structure.js` asserts the section list and the three sentences in the convention and the playbook.

## Consequences

The Original request section is removed. Enhance mode rewrites the body to the current decision and leaves comments on the ticket unchanged. [ADR-0012](0012-ticket-playbook-writes-jira-not-the-repo.md) still holds: the playbook writes nothing to the repository, and an unclear request still becomes a ticket that names its gaps. [ADR-0015](0015-ticket-titles-name-a-capability-or-a-breakage.md) still holds for titles.
