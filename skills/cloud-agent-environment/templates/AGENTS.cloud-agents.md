## Cloud agents

Install and start for the Cursor Cloud Agent Environment. How an Environment differs from the GitHub App is in neat-os [docs/cursor-environments.md](https://github.com/shedcollective/neat-os/blob/develop/docs/cursor-environments.md). This section is this repo's install, hosts, and services.

A secret or a network rule reaches only agents and VMs started after the change. A long-running agent VM keeps the previous environment. Verify on an agent started after the save.

### Secrets

Names only. Values stay in Cursor Team secrets as Runtime Secrets. Do not write a token into this repo.

| Name | Used for |
| --- | --- |
| `COMPOSER_GITHUB_TOKEN` | Composer GitHub OAuth, built in memory as `COMPOSER_AUTH`. Not the injected `GITHUB_TOKEN`, and not `gh auth token`. |

Delete a row this repo does not use. `COMPOSER_GITHUB_TOKEN` is a fine-grained personal access token with public-repo read, owned by an account outside the organisation.

### Network hosts

Least trust: only the hosts setup and start contact. A metadata registry stays closed when every lockfile dist URL is already on a host in this table.

| Host | Why |
| --- | --- |
| `github.com` | Git |
| `api.github.com` | GitHub API, Composer rate limit, and GitHub archive dist URLs |
| `codeload.github.com` | GitHub archive downloads |
| `objects.githubusercontent.com` | Release assets |
| `raw.githubusercontent.com` | Raw files a script fetches |

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
