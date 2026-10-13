---
name: cloud-agent-environment
description: Set up install and start scripts for a Cursor Cloud Agent Environment that already exists. Discover runtimes from the product repo, probe hosts, install lockfiles as archives, start backing services, verify, and document. Does not create the Environment, change dashboard network policy, or rebuild a snapshot.
---

# cloud-agent-environment

Set up a reliable install and start for a Cursor Cloud Agent on a product repo. The agent discovers what the tree needs, probes the network, installs from lockfiles as archives, starts backing services, and writes down the hosts and secret names. Generic guidance and helper scripts. No per-project folklore.

This is **not** a launch playbook. Do not run it from `init`, `gather`, or `learn`. Locate neat-os the same way (`resolve-consume.sh` or `require('@shedcollective/neat-os').resolveConsume()`): `NEAT_OS_ROOT`, then `node_modules/@shedcollective/neat-os`, then `vendor/shedcollective/neat-os`, then sibling `../neat-os`. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`. Call the helper scripts from the resolved tree so a pin update fixes them.

How an Environment differs from the GitHub App is [docs/cursor-environments.md](../../docs/cursor-environments.md). This playbook starts once that Environment exists and the product repo and neat-os are cloned together. It does not create the Environment.

## Hard rules

- **Discover from the tree.** Runtimes, lockfiles, services, and the test command come from the product repo. An unknown stays unknown. Do not invent a version, a port, or a vendor.
- **Least trust.** Allow only hosts the setup contacts. A metadata registry (Packagist, an npm metadata host) stays closed when every lockfile dist URL is already on an allowed host.
- **Archives, not clones.** Install from the lockfile. `--prefer-dist` picks the archive. `source-fallback false` stops the fall back to git. Fail the run if the log clones.
- **Composer auth is a Runtime Secret.** The name is `COMPOSER_GITHUB_TOKEN`. Build `COMPOSER_AUTH` in memory and set `store-auths false`. Never write the token to disk. Ignore the injected `GITHUB_TOKEN` and `gh auth token`. Both are an app JWT, and Composer rejects them.
- **Fail loudly.** A blocked host, a missing token, a clone, or an unhealthy service stops the script. Do not switch to a slow clone or a quiet retry.
- **Secrets and network rules are not retroactive.** A secret or an allowlist change reaches only agents and VMs started after the save. A long-running agent VM keeps the old state. Verify on a new agent.
- **Do not store secrets or client facts in neat-os.** Secret values and product-only ports stay in the product repo's `AGENTS.md` as names, per [conventions/never-store-secrets.md](../../conventions/never-store-secrets.md).
- **Out of this playbook:** creating or promoting an Environment, activating a build, rebuilding a snapshot, and tagging a release. People do those.

## When to use

A product repo needs Cloud Agent install and start scripts, or the existing ones clone dependencies, hang on a blocked host, or boot services that tests cannot query.

## When not to use

- The Environment does not exist yet, or neat-os is not cloned beside the product repo. Follow [docs/cursor-environments.md](../../docs/cursor-environments.md).
- The task does not change install, start, hosts, or backing services.
- Adoption (`init`, `gather`), proposals (`learn`), tickets, assurance, or dependency bumps.

## Inputs

| Input | Where it comes from |
| --- | --- |
| Product repo | The git root the agent was started in. |
| neat-os | The resolve order above. `vendor/` has no skills. |
| Runtimes, lockfiles, services, tests | The tree: version files, manifests, Compose, Makefile, CI, `AGENTS.md`. |
| GitHub token for Composer | Cursor Team secret `COMPOSER_GITHUB_TOKEN`, type Runtime Secret. Not in the repo. |
| Allowed hosts | The hosts the filled scripts contact, probed, then recorded. A person saves the allowlist. |

## Steps

Copy these steps into the todo list. A skipped step stays in the list with a `skip:` reason.

1. **Confirm the Environment and neat-os.** Read [docs/cursor-environments.md](../../docs/cursor-environments.md). Confirm both repositories are cloned. Run `resolve-consume.sh` from the product repo and record `mode` and `skills_dir`. If skills are missing, stop. Do not invent an install.

2. **Discover.** From the tree, list runtimes and versions, package managers, lockfiles, backing services, and the test command. The lockfile beside a manifest names the installer ([conventions/lockfile.md](../../conventions/lockfile.md)). Read Compose, CI service blocks, and `.env` examples for service names and ports. Quote the file that supplied each fact. Leave a gap as unknown.

3. **Probe.** Run `scripts/probe-hosts.sh` on the hosts the chosen route needs, before installing. Record every `dns`, `tls`, and `http` line. A non-zero exit means a host is blocked. Prefer a reachable official archive (a GitHub release, Maven Central) over a blocked vendor site. Pin the version the tree already pins, and record a checksum when the download is not a lockfile. Do not open a metadata registry that the lockfile dist URLs do not use.

   GitHub baseline, when archives come from GitHub: `github.com`, `api.github.com`, `codeload.github.com`, `objects.githubusercontent.com`, `raw.githubusercontent.com`.

4. **Scaffold.** When `.cursor/environment.json` is missing, copy `templates/environment.json`. When it exists, keep fields already set and point `install` at `bash .agents/scripts/setup.sh` and `start` at `bash .agents/scripts/start.sh`. `repositoryDependencies` may list `github.com/shedcollective/neat-os` so the token can read neat-os. It does not clone neat-os. If the schema rejects a field, drop that field and record the error. Do not add a `$schema` key.

   Copy `templates/setup.sh`, `templates/start.sh`, and `templates/resolve-helper-dir.sh` to `.agents/scripts/` and mark them executable. `setup.sh` is the slow idempotent install (toolchains, lockfiles). `start.sh` is the fast boot (services, and a lockfile reinstall only when the hash changes). One script per extra concern, beside those two. Do not bake a lockfile hash into a script. Do not start a daemon in `setup.sh`. Processes do not survive the snapshot.

5. **Install from lockfiles.** Fill `install_dependencies` and the matching `refresh_dependencies`. Wrap the install with `scripts/install-if-lockfile-changed.sh` and `scripts/guard-no-source-fallback.sh`. The stamp defaults to `$HOME/.cache/cloud-agent-environment/lockfiles.sha256`, outside the worktree, so the branch checkout cannot wipe it. Do not delete package caches on boot. Caches age.

   Composer, when `composer.lock` dist URLs are on GitHub:

   ```bash
   bash "$H/install-if-lockfile-changed.sh" \
     --lockfile composer.lock -- \
     bash "$H/guard-no-source-fallback.sh" --composer -- \
     composer install --prefer-dist --no-interaction --no-progress
   ```

   Install the set the tests import. Do not pass `--no-dev` unless the test command does not need `require-dev`. npm uses `npm ci` under the guard without `--composer`. Yarn and pnpm use their frozen install the same way.

6. **Start services.** Fill `start_services`. Start each service locally, skip it when it is already up, and block in `scripts/wait-healthy.sh` until it answers. Document the host and port. Tests must be able to query that endpoint. A TCP check is enough only when the service has no better readiness command. For HTTP, pass `--expect-body` when a 2xx page is not readiness (search cluster health is yellow or green, not merely an open port).

7. **Verify.** On a clean run, time the install, confirm the guard printed no clone, run the repo's test command, and run the health checks. A clone, a failed test, or an unhealthy service means this playbook is not done. Do not report success because the install eventually finished by cloning. Toolchain compiles belong in `setup.sh`. The snapshot pays that cost once. Do not compile on every boot.

8. **Document.** Paste `templates/AGENTS.cloud-agents.md` into the product repo's `AGENTS.md` under the heading it already uses, or as `## Cloud agents`. Replace every `{{...}}` from the discovery notes. Delete secret rows and hosts this repo does not use. Names of secrets only. State that a secret or a network rule applies to agents started after the save.

## Troubleshooting

### GitHub rate limiting (Composer)

An install that should take about a minute takes twenty minutes or more. The log says `Cloning` or `Now trying to download from source`, or `api.github.com` returns 403. Unauthenticated GitHub API and zipball downloads are limited to 60 an hour, so Composer clones.

Fix, in this order:

- Store a fine-grained personal access token as the Team secret `COMPOSER_GITHUB_TOKEN`, type Runtime Secret, public-repo read only, owned by an account outside the organisation.
- Let `guard-no-source-fallback.sh --composer` build `COMPOSER_AUTH` in memory, set `store-auths false` and `source-fallback false`, and require `--prefer-dist`.
- The guard fails the run when the log clones.
- `GET https://api.github.com/rate_limit` with that token must report `resources.core.limit` 5000. The guard fails on any other limit. 60 means the call was unauthenticated.

The cloud agent's `GITHUB_TOKEN`, and `gh auth token`, are an app JWT. Composer rejects them. Do not point `COMPOSER_GITHUB_TOKEN` at either one. The guard exits before it calls Composer when the token matches them, starts with `eyJ`, or starts with `ghs_`.

The secret is visible only to agents started after it was saved.

### Blocked vendor downloads

When an apt archive, a vendor CDN, or a language site is blocked, use a reachable official alternative: a source tag or release asset on GitHub, or Maven Central for JVM artifacts. Pin the version the tree already names, and a checksum. Do not pick a random mirror.

`artifacts.elastic.co` is often blocked. Prefer the official `elastic/elasticsearch` distribution extracted from public image layers on Docker Hub. No Docker daemon. The version is the one this repo already runs. Do not invent it. If the tree does not name a version, stop and leave it unknown.

```bash
bash "$H/extract-image-dist.sh" \
  --image "elastic/elasticsearch:${ES_VERSION}" \
  --dest /opt/elasticsearch \
  --require usr/share/elasticsearch/bin/elasticsearch
```

The script prints `host=` for each host it contacts. Allow `auth.docker.io`, `registry-1.docker.io`, and the blob redirect host. Docker Hub currently redirects layer blobs to `docker-images-prod.s3.dualstack.us-east-1.amazonaws.com`. If the script prints a different redirect host, allow that host and record it. A presigned URL is not a secret to commit. Do not write it down.

Run a single node, with security disabled and a small heap, as a non-root user. Security disabled is for this agent VM so tests can query the node. Do not copy that setting into a deployed environment. `start.sh` waits until cluster health is yellow or green:

```bash
bash "$H/wait-healthy.sh" --timeout 120 \
  --url http://127.0.0.1:9200/_cluster/health \
  --expect-body '"status":"(yellow|green)"'
```

`--print-manifest` resolves the manifest and the redirect host without downloading layer bodies. Use it to confirm the hosts before a full extract. The script fails on a zstd layer, a 401, or a missing `--require` path. Anonymous pull only.

### Least-trust network

Start from the hosts the scripts contact. Add a host only after a probe or a failed install shows it is required. Packagist (`repo.packagist.org`) stays closed when `composer.lock` already has dist URLs on GitHub. `registry.npmjs.org` belongs on the list only when `package-lock.json` points at it.

A person saves the allowlist. The next new agent sees it. The agent that edited the files does not.

### Stale VM

After a secret or an allowlist change, start a new agent. The VM that is already running keeps the old environment, including a missing token and a missing host. A fresh Composer install that still clones is this symptom until that new agent runs.

## Helpers

| Script | Role |
| --- | --- |
| `scripts/probe-hosts.sh` | DNS, TLS, and HTTPS for each host. Exit 1 when any host is blocked. |
| `scripts/install-if-lockfile-changed.sh` | Run the install only when a lockfile hash changes. |
| `scripts/guard-no-source-fallback.sh` | Composer auth in memory, `source-fallback false`, fail on clone. |
| `scripts/wait-healthy.sh` | Retry a URL, a TCP port, or a command until it passes or the timeout expires. |
| `scripts/extract-image-dist.sh` | Extract a public Docker Hub image with tar. No Docker daemon. |
| `templates/resolve-helper-dir.sh` | Print the helper directory from the resolve order. Copied into the product repo. |

Each script supports `--help`, prints errors to stderr, and exits non-zero on failure. None of them prompt.

## Stop

The playbook is complete when the product repo has `.cursor/environment.json`, `.agents/scripts/setup.sh`, and `.agents/scripts/start.sh` filled from the tree, the probe, the guard, the lockfile stamp, and the health checks have been run, the test command has been run, and the Cloud agents section of `AGENTS.md` records secret names, hosts, endpoints, and those results with no `{{` left. It is not complete if a host was allowlisted without a reason, if a clone was accepted, if a secret value was written into a repo, or if this playbook created, promoted, or snapshotted an Environment.

## Source

[GH-2](https://github.com/shedcollective/neat-os/issues/2).
