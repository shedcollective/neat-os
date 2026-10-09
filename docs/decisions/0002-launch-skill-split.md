# 0002 — Three launch playbooks: init scaffolds, gather fills and interviews, learn proposes

**Status:** Accepted
**Date:** 2026-09-07

## Context

Early prototypes had `init` both copy templates and fill them from a repo scan, which produced thin or invented project docs and blurred who owned the interview. `learn` was at risk of becoming a second gather.

## Decision

`init` copies the IDE-spread **structure** only (`AGENTS.md`, `.agents/README.md` Agent Guide template, slots) and leaves placeholders unfilled; it does not scan, does not ask for a ticket prefix, and does not copy company skills. `gather` runs the evidence scan and then a required interview; it is **not complete** until Client and Product are real answers, and Cloud Agents leave **Awaiting interview** unless answers were pre-supplied. `learn` audits history and **proposes** candidates under `.agents/proposals/`; elevation is a human PR. Format for all three is `SKILL.md`; content type is playbook (see `schema/README.md`).

## Consequences

Two commands to reach a filled repo instead of one, in exchange for no invented facts and a clear "incomplete" state. Templates must be safe to leave unfilled. `learn` never writes to shed-os or an org skill store.
