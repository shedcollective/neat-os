---
name: pin-majors-with-reasons
description: Upgrade dependencies by blast radius. Respect `.agents/dependencies/pins.md`. Smoke after each batch. Never take a pinned major on a routine bump.
---

# pin-majors-with-reasons

Upgrade dependencies without treating `yarn outdated`, `npm outdated`, or an automated bump as a licence to take every major.

Pins for this repo live in **`.agents/dependencies/pins.md`**. That file is the source of truth. Do not keep a second pin table in the Agent Guide.

This is **not** a launch playbook. Do not run it from `init`, `gather`, or `learn`. Locate it the same way as those playbooks (`resolve-consume.sh` / `require('@shedcollective/neat-os').skillsDir`). **Do not** search the public web for neat-os. **Do not** copy it into `.agents/skills/`.

## When to use

A ticket or automated dependency pull request asks to update front-end (or mixed) dependencies.

## Steps

1. **Read the pins.** Open `.agents/dependencies/pins.md`. If the file is missing, create it (`init` copies the empty table; otherwise write the same shape: pin table with package, pinned at, reason; held-back table with package, current, blocker) and fill it from a call-site audit before any major. Also read any `.agents/features/*deps*` plan.

2. **Confirm the installer and the runtime.** The lockfile beside the manifest you are changing names the installer ([conventions/lockfile.md](../../conventions/lockfile.md)). Nested `package.json` files are separate roots. Run commands through the Agent Guide's declared runtime (Sail, Compose, or Make). Do not invent a second lockfile in that directory. Do not run host binaries when the guide names a container.

3. **Drop unused packages first.** Confirm zero import sites, then remove them.

4. **Batch unpinned build tooling.** One batch when changelogs are drop-in. Smoke the project's real build (the command from the Agent Guide, inside the declared runtime).

5. **Take remaining unpinned majors one at a time** when the changelog is not drop-in. Smoke after each.

6. **Leave pinned majors unchanged.** If the human asked for one, stop and say it needs its own ticket.

7. **Keep the pin file true.** If a bump invalidated a pin reason or added a new pin, update `.agents/dependencies/pins.md` in the same change.

## Stop

If an automated bump (or the agent) already moved a pinned package, revert that package first. Do not fix forward on the new major inside a routine bump.
