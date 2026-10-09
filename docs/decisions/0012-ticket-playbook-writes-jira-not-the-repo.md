# 0012 — The `ticket` playbook creates or enhances a Jira Task and writes nothing to the repository

**Status:** Accepted
**Date:** 2026-09-11

## Context

Tickets were being written by hand with no shared shape, and the ones agents drafted read like agent output: summaries of the conversation, technical plans, and phrases a project manager would not say to a client. The client reads every ticket in Jira. A fourth playbook was needed that any agent can run from a product repository to create a ticket or bring an existing one up to standard, with the shape locked at company level and the per-client detail (project key, vocabulary, standing acceptance criteria) in the project slots. [ADR-0002](0002-launch-skill-split.md) locked three playbooks; this record adds one and does not change the other three.

## Decision

`ticket` is a playbook under `skills/ticket/`. It reads [conventions/ticket-content.md](../../conventions/ticket-content.md) and the Tickets slot in `.agents/project.md`, takes a brief from the person or an existing ticket key, may read the repository for pointers, drafts the ticket in the locked shape, and creates or updates it in Jira (or GitHub Issues for an OS repo) with whatever ticket tool the runner already has. It writes nothing to the repository: no feature plan, no notes, no commit. The Jira issue type is Task. It sets no estimate, priority, status or assignee. When a person is present and has not yet asked for the ticket to be created, it shows the draft and waits. When the person or the calling agent has asked for it to be created, it creates it. When a required section is still unknown after asking, it creates the ticket anyway, leaves that section out, and lists the open questions under More information needed, each addressed to the client contact or the reporter who can answer it; it never fills a section with a guess or a placeholder. shed-os ships the logic only; it does not ship a Jira adapter.

## Consequences

A ticket describes a problem and an outcome, so the developer who picks it up decides the implementation with a fresh view, and the feature plan under `.agents/features/` is written then, not before. Tone is checked before anything reaches the client. An unclear request still becomes a ticket, so it is visible in the first column and a person chases the answers during triage instead of the brief being lost in a chat; the cost is that some tickets carry questions until a second run in enhance mode fills them. The playbook depends on the runner having Jira or `gh` access, which shed-os does not provide or configure. `docs/launch-skills.md` now describes four playbooks, and `scripts/check` covers the fourth `SKILL.md` with the same frontmatter and resolve-order checks as the first three.
