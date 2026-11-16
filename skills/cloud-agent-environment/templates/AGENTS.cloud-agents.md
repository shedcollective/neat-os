## Cursor Cloud specific instructions

Install and start for the Cursor Cloud Agent Environment. How an Environment differs from the GitHub App is in neat-os [docs/cursor-environments.md](https://github.com/shedcollective/neat-os/blob/develop/docs/cursor-environments.md). This section is this repo's install, hosts, and services.

A credential a script reads is a Runtime Secret. An install-time secret is team or environment scope, because a user secret is not available during a Build. A secret reaches only an agent started after the save. An allowlist change applies to an agent that is already running.

`start.sh` runs `refresh_dependencies` because the feature branch is checked out on top of a Build and may change the lockfiles.

Check that services are healthy before running tests. `start` may not block the agent.

Prefer OIDC to a long-lived cloud key. See [Cloud agent security and network](https://cursor.com/docs/cloud-agent/security-network).

### Secrets

Names only. Values stay in Cursor secrets. Do not write a token into this repo.

| Name | Used for |
| --- | --- |
| {{name}} | {{used for}} |

Delete a row this repo does not use.

### Network hosts

Least trust: only the hosts setup and start contact. A metadata registry stays closed when every lockfile dist URL is already on a host in this table. On a strict allowlist, include `cloud-agent-artifacts.s3.us-east-1.amazonaws.com` exactly. Do not use a wildcard.

| Host | Why |
| --- | --- |
| {{host}} | {{why}} |

### Services

Tests must be able to query each endpoint. The health check is the `wait-healthy.sh` invocation in `.agents/scripts/start.sh`.

| Service | Endpoint | Health |
| --- | --- | --- |
| {{service}} | {{scheme}}://127.0.0.1:{{port}} | {{health check}} |

### Workarounds

{{One paragraph for each blocked host and the route that replaced it, or "None."}}

### Verify

- Cold install: {{seconds}}
- Source clones: 0
- Tests: {{command and result}}
- Services: {{health results}}
