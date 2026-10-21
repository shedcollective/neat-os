# Team setup

The Cursor and GitHub settings this OS uses, and the steps for bringing a project into neat-os. Install recipes are in [consume.md](consume.md). What an Environment is, and why each engagement gets one, is in [cursor-environments.md](cursor-environments.md).

Four things are fixed:

1. Company knowledge for agents lives in `<org>/neat-os`.
2. Product work lives in one repository per project. That repository installs neat-os from GitHub Packages, or with a git pin to a release tag ([consume.md](consume.md)). Agents use the git pin ([ADR-0019](decisions/0019-publish-github-packages.md)).
3. A Cloud Agent runs on one product repository plus neat-os, never on every client at once.
4. neat-os ships by merging `develop` to `main` and publishing a tagged GitHub Release ([release.md](release.md)).

## Who owns what

| Role | Owns |
| --- | --- |
| neat-os maintainers | Releases and tags, Environment naming, the install documentation |
| Delivery team | The Environment for each project, the install in each product repository, day-to-day pull requests into `develop` |
| Team admins | Cursor seats, the GitHub App installation, the protected git scope, and the secrets policy |

## GitHub organisation settings

| Setting | Value |
| --- | --- |
| Cursor GitHub App | Installed on the `<org>` organisation, not on a personal account |
| Repository access | Only selected repositories. Add each product repository as it onboards. `neat-os` is always selected. |
| App permissions | Cursor's defaults: code read and write, Packages read, Actions, pull requests. The Packages permission does not let an agent's token install from the npm registry on GitHub. An agent installs from git. |
| Protected git scope, a Cursor team setting | Set to `<org>`, so Cloud Agents run by the `<org>` team can only reach this organisation's repositories |
| IP allow list, if enabled | Allows the addresses of installed GitHub Apps, which covers Cursor |
| GitHub Packages | Product repositories may install the published package. The token and `.npmrc` are in [consume.md](consume.md). Do not create a Packages token for an agent during onboarding. An agent installs from the git pin. |

## Cursor team settings

| Setting | Value |
| --- | --- |
| Seats | Everyone who runs Cloud Agents is a member of the team |
| Integrations | GitHub is connected at team level. Cloud Agents need this. |
| Network egress | The team default allow list, tightened if a client contract requires it |
| Who edits Environments | Team admins |

## Environments

One Environment per project. Each Environment holds that product repository and `neat-os`.

| Environment | Repositories |
| --- | --- |
| `neat-os` | `<org>/neat-os` only, for work on neat-os itself |
| `client-<slug>` | The product repository and `<org>/neat-os` |

To create one, open [cursor.com/dashboard/cloud-agents](https://cursor.com/dashboard/cloud-agents), go to Environments, choose New, and select every repository the Environment needs. Wait until the first build is active and lists both clones, then start agents from that Environment.

The `repositoryDependencies` setting in `.cursor/environment.json` widens the agent's token. It does not clone a second repository. It is not a substitute for a two-repository Environment.

## Defaults for a product repository

| Setting | Value |
| --- | --- |
| Default branch | `develop` |
| `main` | Pull requests only, no direct pushes, once the team is ready to enforce it |
| Install | GitHub Packages or a git pin for Node, and Composer VCS for PHP. Agents use the git pin. See [consume.md](consume.md) ([ADR-0019](decisions/0019-publish-github-packages.md)). |
| Agent files | Created by `init`, filled by `gather`, with `learn` run later when useful. See [launch-skills.md](launch-skills.md). |
| Skills | Read from the installed package. Never copied into `.agents/skills/`. |
| Agent Guide | Kept rich and in the repository. `gather` fills it; `init` does not. |
| First smoke test | Install only. No deploy, no edits to client content. One pull request that shows the install working is enough. |

## A new project

1. Create a private repository under `<org>`.
2. Add it to the Cursor GitHub App's repository list.
3. Create the Environment `client-<slug>` with that repository and `neat-os`, and wait for a green build that lists both clones.
4. Add the install to the repository ([consume.md](consume.md)).
5. Run `init`, then `gather`, until Client and Product are filled.
6. Protect `main` when the team agrees. Feature work goes to `develop`.

## An existing project

1. Add the repository to the Cursor GitHub App's repository list.
2. Create the Environment `client-<slug>` with that repository and `neat-os`, and wait for a green build.
3. Check the install works before creating any files: `npm install ../neat-os` in the Environment, or the Composer require at the repository root, followed by the install check in [consume.md](consume.md).
4. Run `init`. It does not overwrite existing files. Then run `gather` with the interview.
5. Continue normal delivery on `develop`.

## Team bots

A team bot is a scheduled or on-demand agent that runs a neat-os playbook. It is not a coding agent in a product repository.

Every team bot has a **bot passport** before it runs a routine. Copy [templates/agent/passport.md](../templates/agent/passport.md) into the private operations record and fill it. Do not commit a filled passport in neat-os. Change a passport by pull request. A director merges.

The passport lists every skill (OS playbook, passport enhancement, or bot-only) and every routine. Install only the routines whose Owner is this passport's owner. Skip a routine when a wrapper for that owner, name, and schedule already exists. Two passports never share a wrapper path.

Role-neutral examples for the design agent and the UX agent are [templates/agent/passport-design.md](../templates/agent/passport-design.md) and [templates/agent/passport-ux.md](../templates/agent/passport-ux.md). Copy one into the private record and fill the team's facts. Their rules are [conventions/design-ux-agents.md](../conventions/design-ux-agents.md). Design playbooks are `design-brief`, `mockup`, `brand-from-site`, `brand-board-from-assets`, `naming-and-voice`, and `design-handoff`. `design-qa` belongs to the assurance role. UX playbooks are `ux-audit`, `research-synthesis`, and `wireframes`.

The pin on that passport is a neat-os release tag. The wrapper that runs the routine uses the same pin and reads playbooks from `<neat-os-path>` at that tag ([routine-settings.md](../conventions/routine-settings.md), [ADR-0022](decisions/0022-wrapper-shared-path.md)). If the path or the tag is missing, the wrapper stops. How that path is populated is [issue #15](https://github.com/shedcollective/neat-os/issues/15).
