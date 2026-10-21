---
name: release
description: >-
  Cut a git-flow release on a product repository from the Release slot in
  .agents/project.md. Confirm the semver, bump the configured version files,
  refresh locks, and finish with approved notes on the production branch.
  Stop before the production deploy. Runs only when named.
disable-model-invocation: true
---

# release

Cut a **git-flow release** on a product repository. Production deploy after the push is **manual**. Stop once the remotes are updated.

Run this playbook only when a person names it. A version that looks due is not a request.

This is **not** a launch playbook. Do not run it from `init`, `gather`, or `learn`. Locate neat-os the same way those playbooks do (`resolve-consume.sh` / `require('@shedcollective/neat-os').resolveConsume()`). **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`. A product repository does not override the playbook. It fills the Release slot.

Releasing neat-os itself follows [docs/release.md](../../docs/release.md). If Version files in the Release slot is `none`, stop and report that sentence. Do not start a release branch.

## When to use

- A person asks to cut a release, start or finish a git-flow release, bump the project version, or tag the production branch.
- The Release slot names the version files.

## When not to use

- Shipping neat-os. That is [docs/release.md](../../docs/release.md), and a person publishes it.
- A hotfix. This playbook has no hotfix steps. If the person asks for a hotfix, stop and say so. Do not start a release branch in its place.
- Filling project facts (`gather`) or proposing a skill (`learn`).

## Settings

Read `.agents/project.md` in the product repository. The Release slot is the source of truth, the same way `ticket` reads the Tickets slot. Environment & workflow supplies the integration branch. Company git-flow (integration `develop`, production `main`, release prefix `release/`) is the default only after the person confirms a bullet that is still unanswered. Do not apply it silently ([never-invent-facts](../../principles/never-invent-facts.md)).

| Bullet | Meaning |
| --- | --- |
| Version files | Paths whose version is the release semver. `none` means this repository is not cut by this playbook. |
| Lock refresh | Command that refreshes lockfiles after the bump and does not run scripts. For Composer that is `composer update --lock --no-scripts`, or the project's command when it does the same (lock only, no scripts). `none` means there is no lock to refresh. |
| Tag prefix | Characters before the semver on the tag. `empty` means the tag is the semver (`1.2.0`). |
| Production branch | Branch the tag and the release merge must land on (`main` or `master`). |
| Release branch prefix | Prefix git-flow uses for the release branch, usually `release/`. |
| Finish hook | Hook that must pass before finish. `none` means there is no hook. |
| Hook install | Command that installs that hook. `none` when Finish hook is `none`. |
| Notes surface | Where a person reads the approved notes. `annotated tag` means the annotated tag body. A repo-relative path means that file as well as the tag. |
| Compose service | Compose service name the lock refresh runs in. `none` means the command does not run in a container. Never a container id. |
| Integration branch | Environment & workflow bullet `Integration branch (usually develop)`. |

A blank value, `awaiting interview`, `to confirm`, `{{to confirm}}`, or `TODO / ask` is unanswered. Ask once, in one batch, then write the answers into the Release slot. Commit only that file on the integration branch (`docs: record the release slot`) when the tree was otherwise clean. If anything else is dirty, stop. Do not start the release until the slot is filled and the tree is clean.

## Hard rules

- **Ask for the semver.** Use the runner's structured question (choices in the chat). Do not ask in prose, and do not guess. A version already written in the chat is not a confirmation. Show the latest tag and the current version-file values in the prompt. Offer the next patch and the next minor from that tag. The person can type another version. Do not start until they answer. If the proposed semver is equal to or lower than the current version in any configured version file, abort and report both values. Do not start the release.
- **Ask for the notes.** Show the draft in a second structured question and wait. One choice approves the draft as written. The other means the person will edit the notes in chat. Do not finish until that edited text arrives. If the drafted release notes are empty, abort and report. Do not ask for approval of an empty list, and do not finish.
- **The tag lands on the production branch.** After finish, the tag commit and the release merge are reachable from `origin/<production branch>`. A tag that exists only on the integration branch is not a release ([conventions/git.md](../../conventions/git.md)). The default branch is often that integration branch. Verify. Then stop.
- **Never force-push** the production branch or the integration branch. `git flow release finish -f <file> -p` uses `-f` as the notes file and `-p` to push. Those flags are not `--force`.
- **Never skip hooks.** Do not pass `--no-verify`. If the finish hook fails, fix the version files or the lock, commit those files, and finish again.
- **Never finish** when a version file is not `<semver>`, or when the lock refresh still produces a diff.
- **If finish fails halfway, stop and report.** Name the branches, the tag, and whether each exists on origin. Do not push, reset, delete, or move a tag to recover.
- **Commit only the version files,** the lockfiles the refresh changed, and the notes file when Notes surface is a path in the repo. Nothing else.
- **Do not deploy.** Do not publish a hosting release, press a deploy button, or run a deploy workflow.

## Preconditions

Check these before `git flow release start`. Fetch first so the tag and the remote branches in the semver question are current.

- Working tree clean, then on the integration branch. `git fetch origin`. Local integration matches `origin/<integration branch>`.
- git-flow is installed. Its branch names and prefixes match the slot: production branch, integration branch, release prefix, tag prefix. The git-flow key for the production branch is `gitflow.branch.master` even when that branch is `main`. If git-flow is missing or the values differ, stop and report. Do not run `git flow init`.
- When Finish hook is not `none`, run Hook install. When that command fails, stop.
- Run Lock refresh and Hook install through the runtime the slot names ([use-the-declared-runtime](../../principles/use-the-declared-runtime.md)). If the command fails because the runtime is down, stop and report. Do not start a stack the slot does not name. When the lock refresh runs in a container, the Compose service name comes from the Compose service bullet (the same name Layout & start lists under Containers / Compose). Do not pass a container id, and do not hard-code a service name.

## Version files

Bump only the paths in Version files. Do not bump a manifest the slot does not name.

For `composer.json` and `package.json`, read and write with `jq`, and only the top-level `version` key. Do not match a nested `version`. If `jq` is missing, or the file is not JSON, abort and report. Do not edit the file by hand or with a search that can hit another key.

```bash
jq -r '.version' composer.json
jq --arg v '<semver>' '.version = $v' composer.json
```

Write the `jq` result back over the same file. `.version = $v` sets that one key.

When Lock refresh is not `none`, run it after the bump. Composer is `composer update --lock --no-scripts`, or the slot's command when that command updates the lock only and passes `--no-scripts`. If the slot's Composer command lacks `--lock` or `--no-scripts`, abort and report. Do not run it. When Compose service is not `none`, run the command with `docker compose exec <service>` (or `docker-compose exec <service>` when the Agent Guide starts that way). `<service>` is the Compose service bullet. If the slot's command already execs into a container, the service it names must be that bullet. A container id is an abort. If it changes a file that is not a lockfile beside one of those manifests, stop and report. Do not commit that file ([conventions/lockfile.md](../../conventions/lockfile.md)).

## Notes list

Previous tag: `git describe --tags --abbrev=0 origin/<production branch>`. If that fails, there is no previous tag. Say so. Do not invent a start tag.

Range: that tag (or the start of history) to `HEAD`, first-parent merges only.

```bash
git log --merges --first-parent <prev-tag>..HEAD --format='%s'
```

Drop `Merge tag '…'` and `Merge branch 'release/…'`.

Rewrite each remaining merge into one bullet. The key and the title come from the merged branch or the pull request. The type is the Conventional Commits type, with an initial capital. This shape is an example:

```text
Release 1.2.0

- [ACME-123] Feat: Respect the parent publish state
- [ACME-124] Chore: Update dependencies
```

`ACME-123` stands in for the key on that merge. Do not invent a key. If the branch and the pull request have no key, show the title and say the key was absent. If the drafted release notes are empty, abort and report. Squash-merge may have removed the merge signal. Do not back-fill bullets from individual commits, and do not finish with an empty list.

The approved text is the changelog. The merge commit stays the git-flow default (`Merge branch 'release/<semver>'`). `git flow release finish -f` writes the **tag** message. `-p` pushes the integration branch, the production branch, and the tag.

When Notes surface is `annotated tag`, a person reads `git show <tag>`. When it is a repo-relative path, write the same text there too, and include that file in the version commit.

## Steps

Copy this list into the todo list. A skipped step stays, with a `skip:` reason.

- [ ] Release slot read. Unanswered bullets asked once and written back
- [ ] Semver confirmed with a structured question
- [ ] Integration branch clean, fetched, and matching origin
- [ ] git-flow config matches the slot. Hook install has run when a hook is named
- [ ] `git flow release start <semver>`
- [ ] Version files bumped. Lock refresh has run when it is not `none`
- [ ] Only those files committed
- [ ] Notes drafted and approved with a structured question
- [ ] Versions still match, and the lock refresh produces no diff
- [ ] `git flow release finish -f <notesfile> -p <semver>`
- [ ] Tag and release merge verified on the production branch
- [ ] Stop. The person deploys

1. **Read the slot and locate neat-os.** `git rev-parse --show-toplevel`. Resolve neat-os with the locked order. Read the Release slot and the integration branch. Apply [Settings](#settings) when a bullet is unanswered.

2. **Confirm the semver.** Fetch. Read the latest tag on the production branch and the top-level version in each version file with `jq -r '.version'`. Ask with a structured question. The prompt shows the tag, those versions, the production branch, and the tag that would be created (`<tag prefix><semver>`). Choices are the next patch, the next minor, and a free-typed version. From `1.2.0`, the next patch is `1.2.1` and the next minor is `1.3.0`. Do not offer a next major. If the latest tag is not `MAJOR.MINOR.PATCH`, offer only the free-typed version. Strip a typed tag prefix before `git flow release start`. If the person types a prefix that does not match the slot, stop and ask. Compare the proposed `MAJOR.MINOR.PATCH` with each file. If it is equal to or lower than any current version, abort and report the path and both numbers. Do not start.

3. **Check preconditions.** Apply [Preconditions](#preconditions). Then `git flow release start <semver>`.

4. **Bump and lock.** Set each JSON version with `jq`, top-level `.version` only. Run Lock refresh when it is not `none`, as [Version files](#version-files) describes (`composer update --lock --no-scripts` for Composer, in the configured Compose service when there is one). Commit only the files [Hard rules](#hard-rules) allow. Subject: `chore: update version to <semver>`. The body lists the paths. Add a ticket key only when the person gave one for this release.

5. **Draft the notes and wait.** Build the list in [Notes list](#notes-list). If the drafted release notes are empty, abort and report. Otherwise ask with a structured question. On approval, write the text to a temp file outside the repo (for example `/tmp/release-notes-<semver>.txt`). When Notes surface is a path, write that file too and commit it with the version files if it is still uncommitted. Accept the default merge subjects.

6. **Finish.** Assert each JSON version with `jq -r '.version'` and confirm it is `<semver>`. That read is the top-level key only. Re-run Lock refresh when it is not `none`. If it produces a diff, do not finish. Commit the lock only when the diff is confined to the expected lockfiles, then check again. Then:

   ```bash
   git flow release finish -f /tmp/release-notes-<semver>.txt -p <semver>
   ```

7. **Verify the production branch.** Fetch. Let `<tag>` be `<tag prefix><semver>`.

   ```bash
   git ls-remote --tags origin "refs/tags/<tag>"
   git merge-base --is-ancestor "<tag>" "origin/<production branch>"
   ```

   The ancestor check must exit 0: the tag commit is on the production branch. Also confirm `origin/<production branch>` contains the release merge, and `origin/<integration branch>` contains `Merge tag '<tag>' into <integration branch>`. If the ancestor check fails, or the tag is only on the integration branch, stop and report the SHAs. Do not delete the tag, do not force-push, and do not invent a recovery. The same rule for neat-os tags is in [docs/release.md](../../docs/release.md).

8. **Stop.** Tell the person the tag and that they deploy production themselves. Do not deploy.

## Stop

The playbook is complete when the tag and the release merge are on `origin/<production branch>`, the integration branch has the tag back-merge, and the person has been told they deploy. It is also complete when it stopped because the slot was unanswered, the proposed version was equal to or lower than a current version, the drafted release notes are empty, git-flow did not match, a hook or lock check failed, or finish failed halfway. It is not complete if a deploy was started, a hook was skipped, or a tag was left only on the integration branch without that being reported.

## Source

Elevation draft: [.agents/proposals/2026-10-20-release.md](../../.agents/proposals/2026-10-20-release.md). The production-branch tag rule is [conventions/git.md](../../conventions/git.md).
