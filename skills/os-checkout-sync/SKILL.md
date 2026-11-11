---
name: os-checkout-sync
description: >-
  Nightly, and on demand when a release lands: clone the shared neat-os
  checkout on main if it is missing, then fetch tags and fast-forward main
  only. Record neat-os vX.Y.Z (sha) in a version file next to the checkout.
  Report only on failure, divergence, being off main, being behind the latest
  release, or a new release. Never commit, reset, force-push, or rewrite the
  checkout. Named maintainer only.
---

# os-checkout-sync

Keep the one shared neat-os checkout at `<neat-os-path>` on `main` and equal to the latest release tag. Record `neat-os vX.Y.Z (sha)` in a version file **next to** the checkout, not inside it. The rule is [conventions/routine-settings.md](../../conventions/routine-settings.md). The short commands a person can run by hand are in [docs/consume.md](../../docs/consume.md#agents).

**Only the named neat-os maintainer** for this computer fetches or fast-forwards this checkout. Every other agent only reads it.

A team bot does not run this routine without a filled bot passport ([docs/team-setup.md](../../docs/team-setup.md#team-bots)).

## When to use

- A scheduled midnight-local routine on the computer that holds `<neat-os-path>`.
- A person asks to pull the shared checkout because a release has landed on `main`.
- The named maintainer asks to confirm the checkout is on `main` at the latest release tag.

## When not to use

- Reading a playbook from the checkout. That is every other agent's job, through [templates/ops/bot-skill.md](../../templates/ops/bot-skill.md). Those agents never fetch, pull, or fast-forward.
- Pinning a product repository to a release tag. That is [docs/consume.md](../../docs/consume.md#move-to-a-new-tagged-release).
- Cutting a neat-os release. That is [docs/release.md](../../docs/release.md). After the Release is published, this playbook is the pull on each computer.

## Settings

The routine supplies the shared names in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<neat-os-path>`, `<timezone>`, and `<destination>`. If `<neat-os-path>` is missing, ask once and stop.

These settings belong to this playbook and are filled by the passport or wrapper. They are never defaults in neat-os, except the version-file path below:

| Setting | Required | Meaning |
| --- | --- | --- |
| `<version-file>` | no | Path of the version file **beside** the checkout. Default: the sibling of `<neat-os-path>` named `neat-os.version`. Never a path inside the checkout. |
| `<clone-url>` | no | Git URL used only when `<neat-os-path>` is missing. Default: `https://github.com/shedcollective/neat-os.git`. |

## Hard rules

- **Maintainer only.** Confirm this run belongs to the named neat-os maintainer for this computer (the passport Owner, or the person who asked). Any other role stops here. It does not fetch, pull, switch, merge, or write the version file.
- **Never commit** in the checkout. Never `git add`, never `git commit`.
- **Never rewrite.** Do not `reset`, `rebase`, `checkout --force`, `switch` onto another branch, stash, or force-push. Do not change remotes, hooks, or config in the checkout. Do not push.
- **Fast-forward `main` only.** The only write inside the checkout is `git merge --ff-only origin/main` while `HEAD` is already on `main`. If that fails, stop and report. Do not merge another branch.
- **Leave a bad checkout.** If `HEAD` is not on `main`, or local `main` has diverged from `origin/main`, leave the tree as it is and report. Do not switch. Do not recover.
- **Version file stays outside.** Write `neat-os vX.Y.Z (sha)` to `<version-file>` only. `vX.Y.Z` is `git describe --tags --exact-match`. `sha` is `git rev-parse --short HEAD`. Do not write that line in chat on a quiet run.
- **Stay silent when nothing changed.** Report only on failure, divergence, being off `main`, being behind the latest release, or a new release. A first clone that lands on the latest release is a new checkout: report it. Otherwise make no post to `<destination>` and no chat line.

## Steps

1. Confirm the runner is the named neat-os maintainer for this computer. If not, say so and stop.
2. Confirm `<neat-os-path>` is an absolute path. If it is missing or relative, ask once and stop.
3. If `<neat-os-path>` exists and is not a git checkout, report and stop. Do not delete it. If it does not exist, clone onto `main`. The parent directory must already exist; if it does not, report and stop. Do not invent a shared-folder layout.

   ```bash
   git clone --branch main "<clone-url>" "<neat-os-path>"
   ```

   If the clone fails, report and stop. Do not search the web for another URL. Do not copy playbooks into place.
4. Fetch tags and prune stale remote refs. Do not pull.

   ```bash
   git -C "<neat-os-path>" fetch --tags --prune
   ```

   If fetch fails, report and stop. Leave the checkout as it is.
5. Read `HEAD` and the current branch:

   ```bash
   git -C "<neat-os-path>" rev-parse --abbrev-ref HEAD
   git -C "<neat-os-path>" rev-parse HEAD
   git -C "<neat-os-path>" rev-parse origin/main
   ```

   If the branch is not `main` (including `HEAD` detached), report that the checkout is off `main`, leave it as it is, and stop. Do not `switch`. Do not merge.
6. If `HEAD` and `origin/main` have diverged (neither is an ancestor of the other), or local `main` is ahead of `origin/main`, report the divergence, leave the checkout as it is, and stop.
7. If `HEAD` is already `origin/main`, skip the merge. Otherwise fast-forward `main` only:

   ```bash
   git -C "<neat-os-path>" merge --ff-only origin/main
   ```

   If the merge fails, report the git error, leave the checkout as it is, and stop. Do not retry with a different merge.
8. Confirm `HEAD` is on `main` and equals the latest release tag. The latest tag is the first line of:

   ```bash
   git -C "<neat-os-path>" tag -l 'v*' --sort=-v:refname
   ```

   `git describe --tags --exact-match` must print that tag, and `git rev-parse HEAD` must equal `git rev-parse <tag>`. If `HEAD` is behind that tag, or is on `main` but is not that tag, report it and stop. Do not move `HEAD` to the tag.
9. Write `<version-file>` as one line, `neat-os vX.Y.Z (sha)`, replacing any previous contents of that file. Create the file when it is missing. If the write fails, report and stop.
10. Decide the report:
    - Failure, off `main`, divergence, or behind the latest release: post the reason, the path, the branch, `HEAD`, and the latest tag to `<destination>` (default: the asker).
    - A new release, or a first clone that now matches the latest tag: post `neat-os vX.Y.Z (sha)` to `<destination>`.
    - Already on `main` at the latest tag, and the version file already held that line: stay silent.

## Stop

Complete when the checkout is on `main` at the latest release tag, the version file holds `neat-os vX.Y.Z (sha)`, and either a report was posted for a case in [Hard rules](#hard-rules) or the run stayed silent. Also complete when it stopped because the runner was not the named maintainer, a required setting was missing, fetch or fast-forward failed, or the checkout was off `main` or diverged, and that was reported. Not complete if the checkout was committed to, reset, force-pushed, rewritten, switched off its branch, or merged from a branch other than `origin/main`, or if another role fetched or fast-forwarded it.
