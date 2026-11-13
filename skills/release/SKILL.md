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

Do not run it from `init`, `gather`, or `learn`. A product repository does not override the playbook. It fills the Release slot.

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

- **Ask for the semver.** Use the runner's structured question (choices in the chat). Do not ask in prose, and do not guess. A version already written in the chat is not a confirmation. The prompt shows the latest tag, the current version-file values, the production branch, and the tag that will be created (`<tag prefix><semver>`). Offer the next patch, the next minor, and a free-typed version. Do not offer a next major. A patch is bug fixes, minor tweaks, or copy changes. A minor is new features or significant changes. A major is rarely used, and only when the person types that version. Do not start until they answer. If the proposed semver is equal to or lower than the current version in any configured version file, abort and report both values. Do not start the release.
- **Ask for the notes.** Show the draft in a second structured question and wait. One choice approves the draft as written. The other means the person will edit the notes in chat. Do not finish until that edited text arrives. If the drafted release notes are empty, abort and report. Do not ask for approval of an empty list, and do not finish.
- **The tag lands on the production branch.** After finish, the tag commit and the release merge are reachable from `origin/<production branch>`. A tag that exists only on the integration branch is not a release. The default branch is often that integration branch, so a tag or a published release that does not name the production branch lands there instead. Verify. Then stop.
- **Never force-push** the production branch or the integration branch. Finish with `git flow release finish <semver> --tag --messagefile /tmp/release-notes-<semver>.txt --push`. In `git-flow-next`, `-f` means `--force` and `-p` is not push. Never pass `-f`. Always pass `--tag --messagefile <file> --push`.
- **Never skip hooks.** Do not pass `--no-verify`. If the finish hook fails, fix the version files or the lock, commit those files, and finish again.
- **Never finish** when a version file is not `<semver>`, or when the lock refresh still produces a diff.
- **If finish fails halfway, stop and report.** Name the branches, the tag, and whether each exists on origin. Do not push, reset, delete, or move a tag to recover.
- **Commit only the version files,** the lockfiles the refresh changed, and the notes file when Notes surface is a path in the repo. Nothing else.
- **Do not deploy.** Do not publish a hosting release, press a deploy button, or run a deploy workflow.

## Preconditions

Check these before `git flow release start`. Fetch first so the tag and the remote branches in the semver question are current.

- Working tree clean, then on the integration branch. `git fetch origin`. Local integration matches `origin/<integration branch>`.
- `git-flow-next` is required. `git flow version` reports `git-flow-next`, not classic `git-flow` `0.4.1`. Validate `git flow config list` (or `git config --get-regexp '^gitflow\.'`) against the Release slot. Match the key names without regard to letter case. Native `git-flow-next` keys are `gitflow.branch.<production branch>.type=base`, `gitflow.branch.<integration branch>.type=base`, `gitflow.branch.<integration branch>.parent=<production branch>`, `gitflow.branch.<integration branch>.downstreamstrategy=merge` (required so the update onto the integration branch, usually `develop`, is always a merge commit), `gitflow.branch.<integration branch>.autoupdate=true` (required so that branch auto-updates when its parent, `<production branch>`, changes), `gitflow.branch.release.parent=<production branch>`, `gitflow.branch.release.startpoint=<integration branch>`, `gitflow.branch.release.prefix=<release prefix>`, `gitflow.branch.release.tag=true`, and `gitflow.branch.release.tagprefix=<tag prefix>`. `<release prefix>` and `<tag prefix>` are the Release slot bullets, and `empty` means that value is empty. `git-flow-next` transparently translates legacy AVH keys (`gitflow.branch.master`, `gitflow.branch.develop`, `gitflow.prefix.release`, `gitflow.prefix.versiontag`). The legacy production key is `gitflow.branch.master` even when that branch is `main`. Native `git-flow-next` keys, or those translated AVH keys confirmed by `git flow config list`, satisfy the branch names and prefixes when the values match the slot. Translated AVH keys do not replace `downstreamstrategy=merge` or `autoupdate=true` on the integration branch. If `git-flow-next` is missing, or any of these values differ or are absent, stop and report. Do not change the git-flow config, and do not run `git flow init`.
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

Rewrite each remaining merge into one bullet. The key and the title come from the merged branch or the pull request. The type is the lowercase Conventional Commits type from that pull request title ([conventions/git.md](../../conventions/git.md#pr-titles)). Sort entries with a ticket key (`- [<KEY>] ...`) to the top, and place entries with no key at the bottom. Keep the `git log` order inside each group. Do not drop an entry because it has no key. This shape is an example:

```text
Release 1.2.0

- [ACME-123] feat: Respect the parent publish state
- [ACME-124] chore: Update dependencies
- Update the footer copy (no ticket key)
```

`ACME-123` stands in for the key on that merge. Do not invent a key. If the branch and the pull request have no key, show the title and say the key was absent, and place that bullet at the bottom. If the drafted release notes are empty, abort and report. Squash-merge may have removed the merge signal. Do not back-fill bullets from individual commits, and do not finish with an empty list.

The approved text is the changelog. The merge commit stays the git-flow default (`Merge branch 'release/<semver>'`). Finish with `git flow release finish <semver> --tag --messagefile /tmp/release-notes-<semver>.txt --push`. `--messagefile` writes the **tag** message. `--push` pushes the integration branch, the production branch, and the tag.

When Notes surface is `annotated tag`, a person reads `git show <tag>`. When it is a repo-relative path, write the same text there too, and include that file in the version commit.

## Steps

Copy this list into the todo list. A skipped step stays, with a `skip:` reason.

- [ ] Release slot read. Unanswered bullets asked once and written back
- [ ] Semver confirmed with a structured question
- [ ] Integration branch clean, fetched, and matching origin
- [ ] `git-flow-next` config matches the slot. Hook install has run when a hook is named
- [ ] `git flow release start <semver>`
- [ ] Version files bumped. Lock refresh has run when it is not `none`
- [ ] Only those files committed
- [ ] Notes drafted and approved with a structured question
- [ ] Versions still match, and the lock refresh produces no diff
- [ ] `git flow release finish <semver> --tag --messagefile /tmp/release-notes-<semver>.txt --push`
- [ ] Tag and release merge verified on the production branch, and the back-merge verified on the integration branch
- [ ] Stop. The person deploys

1. **Read the slot.** `git rev-parse --show-toplevel`. Read the Release slot and the integration branch. Apply [Settings](#settings) when a bullet is unanswered.

2. **Confirm the semver.** Fetch. Read the latest tag on the production branch and the top-level version in each version file with `jq -r '.version'`. Ask with a structured question. The prompt shows the tag, those versions, the production branch, and the tag that will be created (`<tag prefix><semver>`). Choices are the next patch, the next minor, and a free-typed version. From `1.2.0`, the next patch is `1.2.1` and the next minor is `1.3.0`. Do not offer a next major. A patch is bug fixes, minor tweaks, or copy changes. A minor is new features or significant changes. A major is rarely used, and only when the person types that version. If the latest tag is not `MAJOR.MINOR.PATCH`, offer only the free-typed version. Strip a typed tag prefix before `git flow release start`. If the person types a prefix that does not match the slot, stop and ask. Compare the proposed `MAJOR.MINOR.PATCH` with each file. If it is equal to or lower than any current version, abort and report the path and both numbers. Do not start.

3. **Check preconditions.** Apply [Preconditions](#preconditions). Then `git flow release start <semver>`.

4. **Bump and lock.** Set each JSON version with `jq`, top-level `.version` only. Run Lock refresh when it is not `none`, as [Version files](#version-files) describes (`composer update --lock --no-scripts` for Composer, in the configured Compose service when there is one). Commit only the files [Hard rules](#hard-rules) allow. Subject: `chore: update version to <semver>`. The body lists the paths. Add a ticket key only when the person gave one for this release.

5. **Draft the notes and wait.** Build the list in [Notes list](#notes-list). If the drafted release notes are empty, abort and report. Otherwise ask with a structured question. On approval, write the text to a temp file outside the repo (for example `/tmp/release-notes-<semver>.txt`). When Notes surface is a path, write that file too and commit it with the version files if it is still uncommitted. Accept the default merge subjects.

6. **Finish.** Assert each JSON version with `jq -r '.version'` and confirm it is `<semver>`. That read is the top-level key only. Re-run Lock refresh when it is not `none`. If it produces a diff, do not finish. Commit the lock only when the diff is confined to the expected lockfiles, then check again. Then:

   ```bash
   git flow release finish <semver> --tag --messagefile /tmp/release-notes-<semver>.txt --push
   ```

7. **Verify the production branch.** Fetch. Let `<tag>` be `<tag prefix><semver>`.

   ```bash
   git ls-remote --tags origin "refs/tags/<tag>"
   git merge-base --is-ancestor "<tag>" "origin/<production branch>"
   git merge-base --is-ancestor "<tag>" "origin/<integration branch>"
   ```

   Both ancestor checks must exit 0. `origin/<production branch>` must contain the release merge. `origin/<integration branch>` must contain the back-merge from `<production branch>`. `git-flow-next` auto-updates the integration branch, because `autoupdate=true`, with a merge commit such as `Merge branch '<production branch>' into <integration branch>`, because `downstreamstrategy=merge`. The subject is not `Merge tag '<tag>'`. If either ancestor check fails, or the tag is only on the integration branch, stop and report the SHAs. Do not delete the tag, do not force-push, and do not invent a recovery. The same rule for neat-os tags is in [docs/release.md](../../docs/release.md).

8. **Stop.** Tell the person the tag and that they deploy production themselves. Do not deploy.

## Stop

The playbook is complete when the tag and the release merge are on `origin/<production branch>`, the integration branch has the back-merge from `<production branch>`, and the person has been told they deploy. It is also complete when it stopped because the slot was unanswered, the proposed version was equal to or lower than a current version, the drafted release notes are empty, `git-flow-next` was missing or did not match, a hook or lock check failed, or finish failed halfway. It is not complete if a deploy was started, a hook was skipped, or a tag was left only on the integration branch without that being reported.
