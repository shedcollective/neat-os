# Composer installs

Read this when the product repo uses Composer. The playbook core stays free of Composer rules.

## Token

Store a fine-grained personal access token as the team secret `COMPOSER_GITHUB_TOKEN`, type Runtime Secret, public-repo read only, owned by an account outside the organisation. An install-time secret is team or environment scope, because a user secret is not available during a Build.

The cloud agent's `GITHUB_TOKEN`, and `gh auth token`, are an app JWT. Composer rejects them. Do not point `COMPOSER_GITHUB_TOKEN` at either one.

Build `COMPOSER_AUTH` in memory and set `store-auths false`. Never write the token to disk.

## Install

Wrap the install so a clone fails the run, and so `source-fallback` stays false:

```bash
bash "$H/install-if-lockfile-changed.sh" \
  --lockfile composer.lock -- \
  bash "$H/guard-no-source-fallback.sh" --composer -- \
  composer install --prefer-dist --no-interaction --no-progress
```

`guard-no-source-fallback.sh --composer` rejects the token before it calls Composer when the token is empty, matches `GITHUB_TOKEN`, matches `gh auth token`, starts with `eyJ`, or starts with `ghs_`. The command must include `--prefer-dist`.

## Rate limit

An install that should take about a minute takes twenty minutes or more when GitHub is unauthenticated. The log says `Cloning` or `Now trying to download from source`, or `api.github.com` returns 403. Unauthenticated GitHub API and zipball downloads are limited to 60 an hour, so Composer clones.

`GET https://api.github.com/rate_limit` with `COMPOSER_GITHUB_TOKEN` must report `resources.core.limit` 5000. The guard fails on any other limit. 60 means the call was unauthenticated.

A secret reaches only an agent started after the save. Verify on a new agent.
