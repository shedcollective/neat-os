# Changelog

## 0.4.1 Unreleased

This repository does not store secrets, credentials, or project-specific information. The convention is [never-store-secrets](conventions/never-store-secrets.md). A secret goes in an environment variable or another store outside the repository. A fact about one product repository goes in that repository's own docs.

The principle set has no numeric cap ([ADR-0018](docs/decisions/0018-no-numeric-principle-cap.md)). Keep the set small. Delete a principle that stops changing behaviour. The elevation bar enforces that rule.

## 0.4.0

The product name is neat-os. The Node package is `@shedcollective/neat-os`. The Composer package is `shedcollective/neat-os`. Install with a git pin, `github:shedcollective/neat-os#vX.Y.Z`. Releases are tagged on `shedcollective/neat-os`.

A repository that already pins shed-os replaces that pin and the Composer package name, and renames `SHED_OS_ROOT` to `NEAT_OS_ROOT`. The same rename applies to `SHED_OS_TICKET_PREFIX` and `SHED_OS_JIRA_PREFIX`. The steps are in [docs/consume.md](docs/consume.md#moving-from-shed-os).

The resolver still reads each old environment variable when the new name is unset. It still finds a sibling `../shed-os`, `node_modules/@shedcollective/shed-os`, and `vendor/shedcollective/shed-os`. Those hits print a deprecation warning. The PHP class is `Neat\Os\NeatOs`.

Publishing to GitHub Packages stays paused. The install documented for product repositories is the git pin. [ADR-0017](docs/decisions/0017-consume-via-github-packages.md) keeps the intent to publish later.

The README carries the lockup, the how-it-fits diagram, and five concept diagrams.

The guide names six playbooks: `init`, `gather`, `learn`, `ticket`, `assurance`, and `pin-majors-with-reasons`.

## Earlier versions

Releases before 0.4.0 were published as shed-os. Those notes stay in the git history and the ADRs. This file does not restate them.
