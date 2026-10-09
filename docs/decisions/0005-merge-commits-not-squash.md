# 0005 — Merge commits, not squash

**Status:** Accepted
**Date:** 2026-09-07

## Context

`learn` uses first-parent merge commits on `develop` as its primary "what landed" signal. Squash merging deletes that signal and flattens the ticket key trail.

## Decision

This OS uses git-flow in every repository (`conventions/git.md`). PRs merge with merge commits. Stacked PRs are permitted for phased features and merge bottom-up into `develop`; the bottom PR is the only one that targets `develop`, and nothing in a stack targets `main`. Release is a `develop → main` PR followed by a tag.

## Consequences

Noisier `git log` without `--first-parent`, in exchange for a history `learn` can read and a merge-message format we can standardise later (open issue).
