# 0022 — Wrappers read neat-os from a shared path at the pin

**Status:** Accepted
**Date:** 2026-10-21

## Context

Wrappers already pin a release tag ([ADR-0021](0021-wrapper-release-tag-pins.md)). The template then followed the playbook through a GitHub blob URL at that tag. A live agent still needs the files on the machine. How that checkout arrives is owned elsewhere ([issue #15](https://github.com/shedcollective/neat-os/issues/15) is parked). A wrapper that cannot see the pin must stop, not search the web and not copy playbooks.

## Decision

A wrapper reads playbooks from a shared filesystem path (`<neat-os-path>`) at the pinned tag. If that path is missing, or the checkout is not the pin, the wrapper says so and stops. It does not search the web, and it does not copy playbooks into the agent. How the path is populated is not this decision; leave that to [issue #15](https://github.com/shedcollective/neat-os/issues/15). GitHub blob links at `vX.Y.Z` stay in the template so a person can open the same pin, and so `scripts/check-structure.js` can still reject a branch pin. The pin rule in [ADR-0021](0021-wrapper-release-tag-pins.md) still holds.

## Consequences

A live routine fails closed when the shared checkout is absent or on the wrong tag. The wrapper does not invent an install. Checking filled pins on the machine still waits for the parked workspace work. The rule is [conventions/routine-settings.md](../../conventions/routine-settings.md). The template is [templates/ops/bot-skill.md](../../templates/ops/bot-skill.md).
