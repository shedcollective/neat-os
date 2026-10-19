# Release

Releases of neat-os happen on `shedcollective/neat-os`. `develop` is the integration branch and always holds the newest reviewed work. A release is a git tag on `main`, published as a GitHub Release. That tag is what product repositories pin, for both Node and Composer. The notes for a release come from [CHANGELOG.md](../CHANGELOG.md).

People merge and people release ([keep-human-gates](../principles/keep-human-gates.md)). Agents prepare the pull request. They do not tag `main`.

Product repositories pin a release. The git pin is `github:shedcollective/neat-os#vX.Y.Z`. A product repository may instead install the same version from GitHub Packages. Both recipes are in [consume.md](consume.md). [ADR-0017](decisions/0017-consume-via-github-packages.md) is partially superseded by [ADR-0019](decisions/0019-publish-github-packages.md): publishing is on, and agents still install from git. `.github/workflows/publish-npm.yml` publishes the Release tag to GitHub Packages. The licence is MIT.

## Steps

1. Open a release-prep pull request into `develop`. It sets the version in the root `package.json`, `packages/npm/package.json`, and the root `composer.json`, and it moves the matching section in [CHANGELOG.md](../CHANGELOG.md) off the unreleased heading. Merge that pull request. Feature work still arrives on `develop` through reviewed pull requests ([conventions/git.md](../conventions/git.md)).
2. Run Prepare release (`.github/workflows/prepare-release.yml`) on `develop`. The input is the version `X.Y.Z`, with no leading `v`. The workflow checks that `develop` is already at that version. If it is not, the run fails. The release-prep pull request is still required. When the check passes, the workflow creates `release/X.Y.Z` from `develop`, opens a pull request into `main`, and creates a draft Release `vX.Y.Z` whose target is the branch `main`. It does not merge and it does not publish. The draft notes are the `X.Y.Z` section of [CHANGELOG.md](../CHANGELOG.md). Before it finishes, the workflow reads the draft back and fails unless the Release is still a draft and its target is the branch `main`.
3. Merge that pull request into `main` with a merge commit, not a squash.
4. Publish the draft Release only after that pull request is merged. GitHub creates the tag `vX.Y.Z` when the draft is published. The tag points at the tip of `main` at that moment. Publishing before the merge tags the previous tip of `main`, which does not contain the release commit. The tag must match the version in the three manifests from step 1. Composer ignores a tag whose `composer.json` declares a different version.
5. Confirm `release-smoke` and `publish-npm` passed on that Release. `release-smoke` installs the tag from git into a scratch project and asserts the skills folder exists and `resolveConsume().mode` is `node_modules`. `publish-npm` publishes that tag to GitHub Packages. Both jobs fetch the full history and fail before that work when the tag commit is not reachable from `main`.
6. Merge `main` back into `develop` so the release commit is not missing from the integration branch.

Product repositories then pin the tag: `git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z` for Node, or the version with no leading `v` for Composer. A repository that already pins neat-os changes the tag and refreshes the lockfile in the same commit. The steps are in [consume.md](consume.md#move-to-a-new-tagged-release). Moving from a shed-os pin is in [consume.md](consume.md#moving-from-shed-os).

A tag that exists only on `develop` is not a release. Pushing tags with `git push --tags` is not a release either. The default branch is `develop`. A Release published with no target uses that default and skips `main`. Publish the draft, which targets `main`.

Prepare release opens a pull request with the workflow token. Turn on **Allow GitHub Actions to create and approve pull requests**. The setting is under Settings, then Actions, then General, then Workflow permissions. An organisation can set it for every repository. The workflow does not approve the pull request. A person merges it.

## First release under the name neat-os (`0.4.0`)

`0.4.0` is the first version whose manifests use the name neat-os. A person publishes it on `shedcollective/neat-os` with the same develop, release branch, main, and tag flow as every later release. Tags that exist only on the archive that held this tree before the cutover, including `v0.0.1` and `v0.1.0`, are not neat-os installs.

## First installable release (`0.1.0`)

The human path for this version, once the reviewed release-prep change is on `develop`:

1. Open `release/0.1.0` from `develop` and merge it into `main` with a merge commit.
2. Publish the GitHub Release targeting `main`:

   ```bash
   gh release create v0.1.0 --target main --title "v0.1.0" --notes "…"
   ```

3. Confirm `release-smoke` passed.
4. Merge `main` back into `develop`.

Agents do not run those commands. People do.

## Tag only what installs

A tag is a promise that `npm install` of that tag works ([ADR-0010](decisions/0010-first-installable-tag.md)). The tag `v0.0.1` was created on the archive, before that tree had a root `package.json`, so installing it fails. Do not document it as an install path. It is not a neat-os tag.

`v0.1.0` was the first installable tag on that archive. From `0.4.0`, product repositories pin a tag on `shedcollective/neat-os`. Moving an existing pin is in [consume.md](consume.md#move-to-a-new-tagged-release). `#develop` is for unreleased work.

Before creating any tag:

1. In a scratch project, run `npm install github:shedcollective/neat-os#<sha>` for the commit you intend to tag. It must succeed, and `require('@shedcollective/neat-os').skillsDir` must point at a folder that exists. CI does this on every push with `github.sha`, and on a pull request with the head commit (`github.event.pull_request.head.sha`), installing the repository the workflow runs in. The pull request merge commit is not a branch tip, so that install uses the head commit instead.
2. After publishing, `release-smoke.yml` repeats the install from `#vX.Y.Z` and checks that `resolveConsume().mode` is `node_modules`.
3. If a published tag fails this test, do not delete it, because a consumer may already have seen it. Publish the next patch tag and say in its release notes that it replaces the broken one.

## Publish the draft

After the pull request is merged into `main`, open the draft Release `vX.Y.Z` and confirm the target branch is `main`. Then publish it. GitHub creates the tag from the tip of `main` at that moment.

Do not run `gh release create` without `--draft`, and do not omit `--target main`. Without that target the tag is cut from the default branch, which is `develop`.

## When a tag is on the wrong commit

If a wrong tag already exists on a commit that is not the release on `main`, delete that tag, and any Release attached to it, before publishing the correct one.

If a tag or Release landed on the wrong commit:

```bash
gh release delete vX.Y.Z --cleanup-tag --yes   # when a Release exists
git push origin --delete vX.Y.Z               # when only the tag exists
gh release create vX.Y.Z --target main --title "vX.Y.Z" --notes "…"
```

## Who does what

| Who | Does |
| --- | --- |
| Contributors and agents | Branch from `develop` and open pull requests into `develop`. Stacked pull requests follow [conventions/git.md](../conventions/git.md#stacked-prs). |
| People | Merge the release-prep pull request, run Prepare release, merge the `main` pull request with a merge commit, publish the draft Release, confirm `release-smoke` and `publish-npm`, and merge `main` back into `develop`. |
| Product repositories | Pin a release tag. Moving an existing pin, including the lockfile, is in [consume.md](consume.md#move-to-a-new-tagged-release). |

Branch protection on `main` is a decision for the team, not a step on this page. Publishing runs from `.github/workflows/publish-npm.yml` when the Release is published.
