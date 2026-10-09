# 0015 — Ticket titles name a new capability or a breakage

**Status:** Accepted
**Date:** 2026-10-06

## Context

The ticket content convention titled every ticket as the desired outcome. That shape matches a new capability and a `feat` description. The same shape on a fix or bug reads as a fact that is already true, so a board scan misses the urgency unless someone opens the ticket or looks at priority. Jira issue type is Task for every ticket, so the title is the place the distinction can live. The title rule has been unchanged since it landed with the ticket playbook, in a pull request recorded in the archive repository. A later issue recorded in the archive repository asks for a breakage title that names what is wrong now.

## Decision

A new-capability title names the outcome the client will have. A breakage title (fix or bug) names what is wrong now, as a present-tense failure or as an unmet obligation that starts with "Ensure". The What section holds the outcome in both cases. When the class is not yet clear, the title names the problem as reported. The shapes live in [conventions/ticket-content.md](../../conventions/ticket-content.md). The `ticket` playbook points at that page.

## Consequences

A board scan can tell a breakage from a new capability without opening the ticket. Feature titles stay reusable as `feat` descriptions. "Ensure" is allowed in a breakage title; the tone list still bans it in the ticket description. Agents classify the request before writing the title. [ADR-0012](0012-ticket-playbook-writes-jira-not-the-repo.md) still holds: a ticket describes a problem and an outcome, and the playbook writes nothing to the repository.
