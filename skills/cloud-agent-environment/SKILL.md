---
name: cloud-agent-environment
description: Set up install, start, and terminals for a Cursor Cloud Agent Environment that already exists. Discover runtimes from the product repo, probe hosts, install lockfiles as archives, start backing services, verify, and document. Does not create or promote the Environment or a snapshot, and does not change dashboard network policy.
---

# cloud-agent-environment

Set up a reliable install and start for a Cursor Cloud Agent on a product repo. The agent discovers what the tree needs, probes the network, installs from lockfiles as archives, starts backing services, and writes down the hosts and secret names. Generic guidance and helper scripts. No per-project folklore.

Do not run it from `init`, `gather`, or `learn`. Call the helper scripts from the resolved tree so a pin update fixes them.

How an Environment differs from the GitHub App is [docs/cursor-environments.md](../../docs/cursor-environments.md). This playbook starts once that Environment exists and the product repo and neat-os are cloned together. It does not create or promote an Environment or a snapshot.

## Hard rules

- **Discover from the tree.** Runtimes, lockfiles, services, and the test command come from the product repo. An unknown stays unknown. Do not invent a version, a port, a vendor, or an `environment.json` field. The schema is [environment.schema.json](https://cursor.com/schemas/environment.schema.json).
- **Least trust.** Allow only hosts the setup contacts. A metadata registry stays closed when every lockfile dist URL is already on an allowed host. On a strict allowlist, add `cloud-agent-artifacts.s3.us-east-1.amazonaws.com` exactly. Do not use a wildcard.
- **Archives, not clones.** Install from the lockfile. Fail the run if the log clones. If the repo uses Composer, read [stacks/composer.md](stacks/composer.md).
- **Fail loudly.** A blocked host, a missing token, a clone, or an unhealthy service stops the script. Do not switch to a slow clone or a quiet retry.
- **Secrets and allowlists differ.** A credential a script reads is a Runtime Secret. An install-time secret is team or environment scope, because a user secret is not available during a Build. A secret reaches only an agent started after the save. An allowlist change applies to an agent that is already running. Verify a new secret on a new agent.
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
| neat-os | The resolve order in [docs/consume.md](../../docs/consume.md). `vendor/` has no skills. |
| Runtimes, lockfiles, services, tests | The tree: version files, manifests, Compose, Makefile, CI, `AGENTS.md`. |
| Credentials the scripts read | Runtime Secrets. Install-time secrets are team or environment scope. Not in the repo. |
| Allowed hosts | The hosts the filled scripts contact, probed, then recorded. A person saves dashboard policy. |

## Secrets

Cursor has three secret types. An Environment Variable is a plain value. A Runtime Secret is redacted, and it is the type for a credential a script reads. A Build Secret is available only to a Dockerfile `RUN --mount`.

## Steps

Copy these steps into the todo list. A skipped step stays in the list with a `skip:` reason.

1. **Confirm the Environment and neat-os.** Read [docs/cursor-environments.md](../../docs/cursor-environments.md). Confirm both repositories are cloned. Run `resolve-consume.sh` from the product repo and record `mode` and `skills_dir`. If skills are missing, stop. Do not invent an install.

2. **Discover.** From the tree, list runtimes and versions, package managers, lockfiles, backing services, and the test command. The lockfile beside a manifest names the installer ([conventions/lockfile.md](../../conventions/lockfile.md)). Read Compose, CI service blocks, and `.env` examples for service names and ports. Quote the file that supplied each fact. Leave a gap as unknown.

3. **Probe.** Run `scripts/probe-hosts.sh` on the hosts the chosen route needs, before installing. Record every `dns`, `tls`, and `http` line. A non-zero exit means a host is blocked. Prefer a reachable official archive. Pin the version the tree already names, and record a checksum when the download is not a lockfile. Do not open a metadata registry that the lockfile dist URLs do not use. Do not probe a host this install does not contact.

   When archives come from GitHub, that set is `github.com`, `api.github.com`, `codeload.github.com`, `objects.githubusercontent.com`, and `raw.githubusercontent.com`.

4. **Scaffold.** When `.cursor/environment.json` is missing, copy `templates/environment.json`. When it exists, point `install` at `bash .agents/scripts/setup.sh` and `start` at `bash .agents/scripts/start.sh`, and keep `build`, `snapshot`, `image`, `terminals`, `ports`, `egressAllowlist`, and `egressMode` as they are. Always leave a `start` field. Terminals were not scheduled when `start` was absent.

   `setup.sh` is build-time work. It installs dependencies, toolchains, and cache warming, then it exits. `start.sh` is for Docker, databases, and tunnels. Daemonise, wait until healthy, then exit. A long-running app server or dev server goes in `terminals`. Each entry has a `name`, a `command`, and a `description` the agent can read.

   The base machine is `build`, `snapshot`, or `image`. Inside `build`, set `dockerfile` or `dockerfileContents`, and set `context` only when the build needs it. Put system packages and compilers there, not in `start.sh`. Do not `COPY` the whole project into the image. The setup guide is [Cloud agent setup](https://cursor.com/docs/cloud-agent/setup). This playbook does not write the Dockerfile.

   A saved Environment reads this file only when its environment.json location points at it. A new Environment defaults that location to None. A personal saved environment and a team saved environment take priority over the committed file. A Build reads the file on the default branch.

   The schema rejects unknown keys (`unevaluatedProperties` is false). Do not add a `$schema` key. Do not add a trailing comma. The schema sets `allowTrailingCommas` to false. Release notes have said otherwise ([changelog](https://cursor.com/changelog)). Follow the schema. If the schema rejects a field, drop that field and record the error. The schema link is [environment.schema.json](https://cursor.com/schemas/environment.schema.json).

   `repositoryDependencies` grants access. It does not clone. Each entry is host-qualified (`github.com/org/repo`). Cursor includes an entry only when the account has write access and the repository has the same owner as the primary repository. Other entries are skipped silently. Do not list `github.com/shedcollective/neat-os`. This Environment already clones both repositories. The same rule is in [docs/cursor-environments.md](../../docs/cursor-environments.md).

   Copy `templates/setup.sh`, `templates/start.sh`, and `templates/resolve-helper-dir.sh` to `.agents/scripts/` and mark them executable. One script per extra concern, beside those two. Do not bake a lockfile hash into a script. Do not start a daemon in `setup.sh`. Processes do not survive the snapshot.

5. **Install from lockfiles.** Fill `install_dependencies` and the matching `refresh_dependencies`. `refresh_dependencies` exists because the feature branch is checked out on top of a Build and may change the lockfiles. Wrap the install with `scripts/install-if-lockfile-changed.sh` and `scripts/guard-no-source-fallback.sh`. The stamp defaults to `$HOME/.cache/cloud-agent-environment/lockfiles.sha256`, outside the worktree, so the branch checkout cannot wipe it. Do not delete package caches on boot. Caches age. If the repo uses Composer, read [stacks/composer.md](stacks/composer.md).

   npm, when `package-lock.json` is the lockfile:

   ```bash
   bash "$H/install-if-lockfile-changed.sh" \
     --lockfile package-lock.json -- \
     bash "$H/guard-no-source-fallback.sh" -- \
     npm ci
   ```

   Install the set the tests import. Do not pass `--no-dev` unless the test command does not need `require-dev`. Yarn and pnpm use their frozen install the same way.

6. **Start services.** Fill `start_services`. For Docker, databases, and tunnels, daemonise, skip a process that is already up, and block in `scripts/wait-healthy.sh` until it answers, then exit. Document the host and port. Tests must be able to query that endpoint. A TCP check is enough only when the service has no better readiness command. For HTTP, pass `--expect-body` when a 2xx page is not readiness. Put a long-running app server or dev server in `terminals`, not in `start.sh`.

7. **Verify.** Check the committed `environment.json` against the schema. Confirm `start` is set, unknown keys are absent, `$schema` is absent, and there is no trailing comma. Confirm `build`, `snapshot`, `image`, `terminals`, `ports`, and the egress fields that were already set are still set. On a clean run, time the install, confirm the guard printed no clone, and run the health checks before the repo's test command. `start` may not block the agent, so do not treat a returned start script as proof the services are up. A clone, a failed test, or an unhealthy service means this playbook is not done. Do not report success because the install eventually finished by cloning. System packages and compilers belong in the base image. Dependency installs belong in `setup.sh`. Do not compile on every boot.

8. **Document.** Paste `templates/AGENTS.cloud-agents.md` into the product repo's `AGENTS.md` under `## Cursor Cloud specific instructions`. Replace an older Cloud agents heading with that heading. Replace every `{{...}}` from the discovery notes. Delete secret rows and hosts this repo does not use. Names of secrets only. Leave the template sentences on secrets, allowlists, `refresh_dependencies`, and the health check before tests.

## Troubleshooting

### Blocked host

When an apt archive, a vendor CDN, or a language site is blocked, prefer a reachable official archive. Pin the version the tree names. Record the hosts the route contacts. Do not invent a version. If the tree does not name a version, stop and leave it unknown.

### Network file

After the probe, this playbook may add `egressAllowlist` and `egressMode` to the committed file. The pull request is the review. A person still approves dashboard policy. `egressMode` is `allow_all`, `parent_plus_network_settings`, `default_with_network_settings`, or `network_settings_only`. On a strict allowlist, include `cloud-agent-artifacts.s3.us-east-1.amazonaws.com` exactly.

### Stale secret

After a secret save, start a new agent. The agent that is already running keeps the old secret. An allowlist change applies to that running agent. A fresh install that still clones, after a new token was saved, is the stale-secret symptom until that new agent runs.

## Helpers

| Script | Role |
| --- | --- |
| `scripts/probe-hosts.sh` | DNS, TLS, and HTTPS for each host. Exit 1 when any host is blocked. |
| `scripts/install-if-lockfile-changed.sh` | Run the install only when a lockfile hash changes. |
| `scripts/guard-no-source-fallback.sh` | Fail on a source clone. With `--composer`, auth stays in memory. |
| `scripts/wait-healthy.sh` | Retry a URL, a TCP port, or a command until it passes or the timeout expires. |
| `templates/resolve-helper-dir.sh` | Print the helper directory from the resolve order. Copied into the product repo. |

Each script supports `--help`, prints errors to stderr, and exits non-zero on failure. None of them prompt.

## Stop

The playbook is complete when the product repo has `.cursor/environment.json` with a `start` field and no unknown keys, `.agents/scripts/setup.sh`, and `.agents/scripts/start.sh` filled from the tree, the probe, the guard, the lockfile stamp, and the health checks have been run before the test command, and the `Cursor Cloud specific instructions` section of `AGENTS.md` records secret names, hosts, endpoints, and those results with no `{{` left. It is not complete if a host was allowlisted without a reason, if a clone was accepted, if a secret value was written into a repo, or if this playbook created, promoted, or snapshotted an Environment.

## Source

[GH-2](https://github.com/shedcollective/neat-os/issues/2).
