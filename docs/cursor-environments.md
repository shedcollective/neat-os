# The GitHub App, Environments, and the install

Three separate things decide whether a Cloud Agent can reach neat-os. Most Cloud Agent problems come from treating one of them as if it were another.

| Layer | What it decides |
| --- | --- |
| The Cursor GitHub App, installed on the `shedcollective` organisation | Which repositories Cursor is allowed to read at all. `neat-os` must be on that list. Being on the list does not clone a repository into a run. |
| A Cloud Agent Environment | Which repositories are cloned together when an agent runs. One Environment per project, holding that product repository and `neat-os`. Never one Environment holding every project. |
| The install | How the agent finds neat-os inside those clones: the sibling checkout `../neat-os`, the `NEAT_OS_ROOT` variable, or a git dependency in `node_modules/`. The recipes are in [consume.md](consume.md). |

The Cursor IDE on your computer is none of these. It uses the computer install from [consume.md](consume.md), and it is not an Environment. If you work in WSL, see [faq.md](faq.md).

## Why each project gets its own Environment

A Cloud Agent needs the product repository and neat-os in the same run. If every product repository sat in one Environment, work for one client would be visible to agents working for another. If an agent is started on the product repository alone, `../neat-os` is not there, the resolve order finds nothing, and the agent either stops or starts guessing at install steps.

The token that the Cursor GitHub App gives an agent can read repositories but cannot read GitHub Packages. Do not work around that with a personal Packages token. An agent installs from git, as [consume.md](consume.md) describes. Publishing to GitHub Packages stays paused ([ADR-0017](decisions/0017-consume-via-github-packages.md)).

The `repositoryDependencies` setting in a product repository's `.cursor/environment.json` (for example `github.com/shedcollective/neat-os`) widens the token so it can read that repository. It does not clone the repository into the run, and it does not replace a two-repository Environment.

## Create an Environment

1. Open [cursor.com/dashboard/cloud-agents](https://cursor.com/dashboard/cloud-agents), go to Environments, and choose New.
2. Select every repository the Environment needs when you create it: `shedcollective/<product-repo>` and `shedcollective/neat-os`.
3. Wait until the first build shows as active and lists both clones.
4. Start agents from this Environment every time. A one-off launch on a single repository will not have neat-os.

Name the Environment for this repository alone `neat-os`, and name each project's Environment `client-<slug>`.

Only team admins edit Environments. Seats, the GitHub App installation, and the other organisation settings are in [team-setup.md](team-setup.md).
