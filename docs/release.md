# Release

Releases of neat-os happen on `shedcollective/neat-os`. `develop` is the integration branch and always holds the newest reviewed work. A release is a git tag on `main`, published as a GitHub Release. That tag is what product repositories pin, for both Node and Composer. The notes for a release come from [CHANGELOG.md](../CHANGELOG.md).

People merge and people release ([keep-human-gates](../principles/keep-human-gates.md)). Agents prepare the pull request. They do not tag `main`.

Product repositories pin `github:shedcollective/neat-os#vX.Y.Z`. [ADR-0001](decisions/0001-consume-via-git-not-packages.md) is superseded by [ADR-0017](decisions/0017-consume-via-github-packages.md), which records an intent to publish to GitHub Packages later. The workflow at `.github/workflows/publish-npm.yml` stays paused, so publishing is not a release step. The licence is MIT. The install is the git pin.

## Steps

1. Feature work arrives on `develop` through reviewed pull requests, using git-flow and merge commits ([conventions/git.md](../conventions/git.md)). A stacked change lands as one merge of the feature branch.
2. To ship a version, open a `release/X.Y.Z` branch from `develop` and merge it into `main` with a merge commit, not a squash. For the first installable release that branch is `release/0.1.0`.
3. Publish a GitHub Release from the tip of `main`. The tag is `vX.Y.Z` and must match the `version` in the root `package.json`, `packages/npm/package.json`, and the root `composer.json`. Tag `v0.1.0` goes with version `0.1.0`. Composer ignores a tag whose `composer.json` declares a different version, so the version bump is part of the release, not an afterthought.
4. Confirm the `release-smoke` workflow passed on that Release. It installs the published tag into a scratch project and asserts the skills folder exists and `resolveConsume().mode` is `node_modules`.
5. Merge `main` back into `develop` so the release commit is not missing from the integration branch.
6. Product repositories pin the tag: `git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z` for Node, or the version with no leading `v` for Composer. A repository that already pins neat-os changes the tag and refreshes the lockfile in the same commit. The steps are in [consume.md](consume.md#move-to-a-new-tagged-release). Moving from a shed-os pin is in [consume.md](consume.md#moving-from-shed-os).

A tag that exists only on `develop` is not a release. Pushing tags with `git push --tags` is not a release either. Publish the GitHub Release.

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

## Publish from the GitHub website

1. If a wrong tag already exists on an older `main` commit, delete that tag, and any Release attached to it, in the GitHub interface first.
2. Open Releases, choose Draft a new release, create the tag `vX.Y.Z` targeting the current `main`, and choose Publish release.

## Publish from the command line

After `release/X.Y.Z` has been merged into `main`:

```bash
gh release create vX.Y.Z --target main --title "vX.Y.Z" --notes "…"
```

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
| People | Merge those pull requests, open `release/X.Y.Z`, merge it into `main`, publish the Release, confirm `release-smoke`, and merge `main` back into `develop` |
| Product repositories | Pin a release tag. Moving an existing pin, including the lockfile, is in [consume.md](consume.md#move-to-a-new-tagged-release). |

Branch protection on `main` and re-enabling `publish-npm.yml` are decisions for the team, not steps on this page.
