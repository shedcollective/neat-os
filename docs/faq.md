# FAQ

Problems we have hit, with the fix for each. The install recipes themselves are in [consume.md](consume.md).

## npm installed the wrong thing from a `github:` spec

`npm install github:shedcollective/neat-os#vX.Y.Z`, or passing a git URL as an argument to `npm install`, can be rewritten by npm into a `github:` shorthand or a `repo^semver.git` form that does not fetch the tag you named.

Write the full git URL into `package.json`:

```text
git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z
```

It is the same host and the same SSH authentication. Replace `X.Y.Z` with the release tag. `#develop` is for unreleased work.

A lockfile that stays on the previous commit after you change that pin is the next section.

## The tag in package.json changed and the install stayed on the old commit

`npm install` keeps the commit already in `package-lock.json`. Run `npm update @shedcollective/neat-os`. For Composer, run `composer update shedcollective/neat-os`. The steps and the check against `git ls-remote` are in [consume.md](consume.md#move-to-a-new-tagged-release).

## Installing tag `v0.0.1` fails

`v0.0.1` was tagged before the repository had a root `package.json`, so `npm install github:shedcollective/neat-os#v0.0.1` cannot find the package `@shedcollective/neat-os`. Do not pin it, and do not tell an agent that it works.

`v0.1.0` is the first installable tag. Pin a release tag. `#develop` is for unreleased work. See [release.md](release.md).

## Composer asks for a GitHub token

On WSL, Composer's VCS driver often tries HTTPS and asks for a token, even when `git ls-remote` and `ssh -T git@github.com` already succeed.

Use the repository URL with the protocol and the port spelled out:

```text
ssh://git@github.com:22/shedcollective/neat-os.git
```

The shorthand `git@github.com:shedcollective/neat-os.git` is fine when it does not prompt. One SSH key, or one token in `~/.composer/auth.json`, covers every product repository.

## Do we need Renovate?

No. Renovate is not a prerequisite for the install or for CI. To move a pin, follow [consume.md](consume.md#move-to-a-new-tagged-release).

## Open a WSL project in Cursor

Keep the project on the Linux filesystem, not under `/mnt/c`, and open it from its directory:

```bash
cursor . --classic
```

The `--classic` flag is part of the recipe that worked. Use the Anysphere Remote-WSL extension (`anysphere.remote-wsl`), not Microsoft's Remote-WSL. This is the computer install described in [consume.md](consume.md), not a Cloud Agent Environment.
