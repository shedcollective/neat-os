# 0007 — GitHub Issues for shed-os and OS leaves; Jira stays for client repos

**Status:** Accepted
**Date:** 2026-09-09

## Context

Shed's PM layer runs on Jira and needs it for client accountability (estimates, Client QA, deployment sign-off). shed-os has none of those stages; its only actors are developers and agents. Running OS work through the Jira board would be columns nobody moves.

## Decision

A ticket lives where the people who must act on it work. Client and product repos use Jira keys. `shed-os`, `shed-os-platform-*` and `shed-os-tool-*` use GitHub Issues in their own repo, keyed `GH-<n>`. Templates and scripts accept either key shape. Commercially scheduled OS work is a Jira engagement with GitHub implementation. No Jira epic for OS effort unless the PM layer asks for one. Detail in `conventions/tickets.md`.

## Consequences

Two key shapes in branches and commits, handled by convention and prefix-agnostic templates, no extra tooling. OS work is invisible to Jira by design while the PM layer is still defining its processes.
