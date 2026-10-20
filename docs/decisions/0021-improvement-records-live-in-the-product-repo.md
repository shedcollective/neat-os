# 0021 — Improvement records live in the product repository and a person approves the summary

**Status:** Proposed
**Date:** 2026-10-20

## Context

Improvements shipped on a live product (a faster page, a batch of accessibility fixes, a conversion change) were invisible once merged. Nobody took a baseline before the change, so nothing could say by how much the product got better, and nothing was in a shape a project page, a client report, or a roll-up could read. [GH-6](https://github.com/shedcollective/neat-os/issues/6) asked for an `improve` playbook and left two questions open: where the records live, and who approves a summary before it is shared outside the team. [#7](https://github.com/shedcollective/neat-os/issues/7) proposes a public stats page built from these records, which needs numbers a tool can add up and a way to keep a client's results out of public view without consent.

## Decision

An improvement record is a file in the product repository, one per improvement, under `.agents/improvements/`, in the shape locked by [conventions/improvement-record.md](../../conventions/improvement-record.md). The repository is the source of truth for the record, and the record travels in the same branch and pull request as the change it measures. The ticket links to the record; it does not hold a second copy. The `improve` playbook writes the record with `status: draft` and never sets `approved`. A person sets status to approved before the summary leaves the repository. That person is the role named under Improvements in `.agents/project.md`, and the account owner for the project when that slot is empty. The same person raises `audience` from `internal` to `client` or `public`; `public` needs the client's consent recorded in that slot.

## Consequences

A record a tool can read sits beside the code, so a later roll-up or an org-wide assessor reads the repository and not a ticket system, and a Cloud Agent can read it with a git checkout and nothing else. Extra keys below the locked ones leave room for that assessor's outcome. The cost is that an improvement without a pull request (a content correction made in a CMS) still needs a commit to the product repository to be recorded. A summary cannot reach a client page or report on an agent's say-so, because a person flips the status, and the merge of the pull request is not that approval. The playbook depends on whichever measuring tool and analytics the project already uses; neat-os ships the shape and the steps, not a tool.
