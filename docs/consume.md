# Install neat-os in a product repository

"Consume" is the word this repository uses for installing neat-os so that an agent working in a product repository can find the playbooks, principles, and conventions. This page holds the install recipes. The root README and the package READMEs point here and do not repeat them.

Access for the git pin is GitHub read access to `shedcollective/neat-os`. The same SSH key or token that clones the product repository installs neat-os from git, for both Node and Composer.

The Node package is `@shedcollective/neat-os`, defined by the root [`package.json`](../package.json). The Composer package is `shedcollective/neat-os`, defined by the root [`composer.json`](../composer.json). One release tag versions both. See [release.md](release.md).

A product repository installs the Node package from GitHub Packages. Agents and Cloud Agents keep the git pin. The token a Cloud Agent receives gets a 403 from the npm registry. Do not create a Packages token for an agent. Composer stays on a VCS repository entry. See [ADR-0019](decisions/0019-publish-github-packages.md).

## Pick the situation that matches yours

| Situation | How neat-os is installed | Where it ends up |
| --- | --- | --- |
| Cloud Agent, in an Environment that clones the product repository and neat-os together | Nothing to install. neat-os is the sibling checkout `../neat-os`. Optionally run `npm install ../neat-os` so `require('@shedcollective/neat-os')` works. Do not use the registry. The agent token gets a 403. | `../neat-os` |
| Local / IDE, a person installing the published package | GitHub Packages. The `.npmrc` and the token are in [GitHub Packages](#github-packages). | `node_modules/@shedcollective/neat-os` |
| Local / IDE, an agent, or any install before that version is published | A git dependency in the repository root `package.json`. A PHP project may also add the Composer package, which carries metadata only. | `node_modules/@shedcollective/neat-os` and, for PHP, `vendor/shedcollective/neat-os` |
| CI, such as GitHub Actions | The same choice as Local / IDE. The registry needs a `read:packages` token in the job. CI installs the committed lockfile. | `node_modules/@shedcollective/neat-os` |

Installing into `node_modules/` or `vendor/` is vendoring. Copying skill files into a product repository's `.agents/skills/` is not, and is not a supported way to install.

## GitHub Packages

Use this when a person or CI installs a published version. Agents and Cloud Agents use the git pin in [Node](#node).

Commit this `.npmrc` at the root of the product repository:

```
@shedcollective:registry=https://npm.pkg.github.com
```

Do not commit a token. The consuming repository needs a token with the `read:packages` scope. The auth line is the same locally and in CI:

```
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Locally, put that line in the user `~/.npmrc` and set `NODE_AUTH_TOKEN` in the environment. In CI, write the same line from the job secret, or set `registry-url` to `https://npm.pkg.github.com` on `actions/setup-node` and pass the secret as `NODE_AUTH_TOKEN`. The npm registry on GitHub requires that token even when the package is public.

Depend on the version, with no leading `v`:

```json
{
  "dependencies": {
    "@shedcollective/neat-os": "X.Y.Z"
  }
}
```

Replace `X.Y.Z` with the release you are pinning. Until a package of that version exists, this install fails. Use the git pin until then.

To move an existing registry pin, set the new version, run `npm update @shedcollective/neat-os`, and commit `package.json` and `package-lock.json` together.

## Node

Use this git pin for an agent, a Cloud Agent, and any install before a package of that version exists on GitHub Packages. A person may also keep this pin.

Write the full git URL into `package.json`. Passing that URL as an argument to `npm install` saves npm's `github:` shorthand instead, which is a separate problem described in [faq.md](faq.md).

```json
{
  "dependencies": {
    "@shedcollective/neat-os": "git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z"
  }
}
```

Replace `X.Y.Z` with the release tag you are pinning. List the tags on `main`:

```bash
git ls-remote --tags git@github.com:shedcollective/neat-os.git 'refs/tags/v*'
```

`v0.0.1` predates the root `package.json` and cannot be installed. `#develop` is the integration branch, for unreleased work. [release.md](release.md) describes how tags are made.

When `package-lock.json` has no entry for `@shedcollective/neat-os` yet, run `npm install`. The package lands at `node_modules/@shedcollective/neat-os`. When an entry already exists, follow [Move to a new tagged release](#move-to-a-new-tagged-release).

To check a first install, print the skills path and confirm the folder exists:

```bash
node -e "console.log(require('@shedcollective/neat-os').skillsDir)"
```

In a Cloud Agent Environment the sibling checkout is already present, so the equivalent is a local path install:

```bash
npm install ../neat-os
```

`file:../neat-os/packages/npm` also works, but prefer the repository root so that a sibling install and a tagged git install expose the same module.

The module exports the version, the paths to the knowledge folders, and the resolver:

```js
const neatOs = require('@shedcollective/neat-os');
neatOs.version;
neatOs.skillsDir;
neatOs.templatesDir;
neatOs.principlesDir;
neatOs.conventionsDir;
neatOs.resolveConsume();
```

## Composer

The Composer package carries PHP metadata only. `Neat\Os\NeatOs::version()` returns the version, and `Neat\Os\NeatOs::knowledgeSourceHint()` returns a sentence that says where the knowledge folders live and how to install them. It does not ship `skills/`, `templates/`, `principles/`, or `conventions/`. A PHP project that needs those installs the Node package as well, or works from a checkout.

If Composer exists in the repository only to include neat-os, put the require in a `composer.json` at the repository root. Do not add neat-os to the application's own `composer.json` under `www/` or `app/`. That manifest belongs to the product.

```json
{
  "name": "shedcollective/<product-repo>",
  "minimum-stability": "dev",
  "prefer-stable": true,
  "repositories": [
    {
      "type": "vcs",
      "url": "ssh://git@github.com:22/shedcollective/neat-os.git"
    }
  ],
  "require": {
    "shedcollective/neat-os": "0.X.Y"
  }
}
```

The constraint is the release version with no leading `v`. Tag `vX.Y.Z` is constraint `X.Y.Z`. `dev-develop` is for unreleased work.

When `composer.lock` does not exist yet, run `composer update`. When the lock file already exists, run `composer update shedcollective/neat-os`. The package lands at `vendor/shedcollective/neat-os/`. `composer update shedcollective/neat-os` before a lock file exists exits with an error and installs nothing.

The URL spells out the protocol and the port because on WSL Composer otherwise tends to fall back to HTTPS and ask for a GitHub token, even when `ssh -T git@github.com` already works. The shorthand `git@github.com:shedcollective/neat-os.git` is fine when it does not prompt. See [faq.md](faq.md).

One SSH key, or one token in `~/.composer/auth.json`, covers every product repository. Do not create a token per project.

The root [`composer.json`](../composer.json) is the Composer source of truth. [`packages/composer/`](../packages/composer/) is the library code, not the entry point. Pin the release version day to day. Use `dev-develop` only for unreleased work. Moving an existing pin is in [Move to a new tagged release](#move-to-a-new-tagged-release).

## How agents find neat-os

An agent that needs the neat-os root, or needs to run `init`, `gather`, or `learn`, searches these locations in order and stops at the first hit. The order is implemented in [`skills/init/scripts/resolve-consume.sh`](../skills/init/scripts/resolve-consume.sh) and in `require('@shedcollective/neat-os').resolveConsume()`, and is locked by [ADR-0003](decisions/0003-resolve-order.md).

1. The environment variable `NEAT_OS_ROOT`, if it is an absolute path to a folder that contains `skills/` and `templates/`. A relative value is skipped with a warning. `SHED_OS_ROOT` is a deprecated fallback, used only when `NEAT_OS_ROOT` is unset or skipped, and it prints a warning.
2. The Node install at `node_modules/@shedcollective/neat-os`, found by walking up from the current directory or with `require.resolve('@shedcollective/neat-os/package.json')`. `node_modules/@shedcollective/shed-os` is a deprecated fallback.
3. The Composer install at `vendor/shedcollective/neat-os`. This is metadata only. `vendor/shedcollective/shed-os` is a deprecated fallback.
4. The sibling checkout `../neat-os`. `../shed-os` is a deprecated fallback.

If the current directory is itself a neat-os tree, the resolver reports mode `checkout`. That happens only when working in this repository. Product repositories never see it.

If all four miss, the agent tells the person how to install neat-os (a git dependency or a sibling checkout) and stops. It does not search the web and does not invent install steps.

## Move to a new tagged release

Changing the tag and running the plain install leaves the previous commit in the lockfile. Write the new tag, refresh that package, then confirm the locked commit.

### Node

These commands are for `package-lock.json` ([lockfile.md](../conventions/lockfile.md)).

1. In `package.json`, set `@shedcollective/neat-os` to `git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z`.
2. Run `npm update @shedcollective/neat-os`.
3. Commit `package.json` and `package-lock.json` together.

### Composer

1. Set the constraint to the version with no leading `v`. Tag `vX.Y.Z` is constraint `X.Y.Z`.
2. Run `composer update shedcollective/neat-os`.
3. Commit `composer.json` and `composer.lock` together.

### Confirm the commit

```bash
node -e "console.log(require('./package-lock.json').packages['node_modules/@shedcollective/neat-os'].resolved)"
git ls-remote git@github.com:shedcollective/neat-os.git refs/tags/vX.Y.Z
```

The commit after `#` in the lockfile must equal the commit `git ls-remote` prints for that tag. For Composer, `composer show shedcollective/neat-os` prints the same commit at the end of the `source` line.

Pin an exact tag. `npm ci` and `composer install` install the locked commit, so a semver range or a floating dist-tag does not move CI onto a newer release by itself. An automation that opens pull requests for those exact-tag bumps is a separate follow-up.

### Update copied guide sentences

After the pin moves, update the product repository's guide only where [`templates/AGENTS.md`](../templates/AGENTS.md) or a [convention](../conventions/README.md) changed a sentence that the guide copied. Do not write the release version into that repository's `AGENTS.md` or `.agents/project.md`. The pin is `package.json`. The [Company knowledge](../templates/.agents/project.md#company-knowledge) slot records the consume mode, not the tag.

## Access

An agent needs GitHub read access to `shedcollective/neat-os`, through the organisation's team permissions, over HTTPS or SSH. Cloud Agents use the token of the Cursor GitHub App installation. That token cannot read GitHub Packages (403). Do not create a Packages token for an agent. Agents install with the git pin on this page. A person or CI that installs from the registry uses a token with `read:packages`, as in [GitHub Packages](#github-packages) ([ADR-0019](decisions/0019-publish-github-packages.md)).

## Moving from shed-os

Releases from 0.4.0 use the name neat-os. The version notes are in [CHANGELOG.md](../CHANGELOG.md). A repository that already pins shed-os changes three things, then refreshes the lockfile as in [Move to a new tagged release](#move-to-a-new-tagged-release).

1. Replace the git pin with `github:shedcollective/neat-os#vX.Y.Z`. In `package.json` that is `git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z`, and the package name is `@shedcollective/neat-os`.
2. In Composer, replace `shedcollective/shed-os` with `shedcollective/neat-os` and point the VCS URL at `shedcollective/neat-os`. The PHP class is `Neat\Os\NeatOs`.
3. Rename `SHED_OS_ROOT` to `NEAT_OS_ROOT`. The same rename applies to `SHED_OS_TICKET_PREFIX` (`NEAT_OS_TICKET_PREFIX`) and `SHED_OS_JIRA_PREFIX` (`NEAT_OS_JIRA_PREFIX`).

The resolver still reads each old name when the new one is unset, and it still finds `../shed-os`, `node_modules/@shedcollective/shed-os`, and `vendor/shedcollective/shed-os`. Those hits print a deprecation warning.
