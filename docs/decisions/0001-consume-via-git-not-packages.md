# 0001 — Consume shed-os via git, not a Packages registry

**Status:** Superseded by 0017
**Date:** 2026-09-07

## Context

Product repos and Cursor Cloud Agents need to read shed-os knowledge (`skills/`, `templates/`, `principles/`, `conventions/`). GitHub Packages was the first plan for npm. The Cursor GitHub App install token cannot read `npm.pkg.github.com` (403) and a Packages PAT for agents was rejected on security grounds. Composer is not a GitHub Packages client at all.

## Decision

Node consumers install from git: sibling `file:../shed-os` in multi-repo Cloud Agent environments, or `github:shedcollective/shed-os#vX.Y.Z` (tagged ref on `main`) for IDE and CI. Composer consumers use a VCS `repositories` entry against the private repo; Composer ships PHP metadata only, not the knowledge tree. Privacy is GitHub org/repo ACLs. `publish-npm.yml` stays paused; no `NODE_AUTH_TOKEN`, no `.npmrc` registry lines.

## Consequences

Same auth story for both ecosystems and for humans and agents. A tag is only installable if its tree has a root `package.json` (v0.0.1 does not; v0.1.0 will). No second registry product to run. If a future workflow genuinely needs Packages it is a separate decision, not the agent path.
