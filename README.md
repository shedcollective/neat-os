<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/banner-b-lockup-wordmark-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/assets/readme/banner-b-lockup-wordmark-light.svg">
    <img alt="neat-os: an operating standard for AI coding agents" src="docs/assets/readme/banner-b-lockup-wordmark-light.svg" width="100%">
  </picture>
</p>

# neat-os

neat-os is the shared knowledge that Shed's AI agents work from. It is an operating standard: the fixed set of rules and procedures the agents run on, whichever project they are working in. It is a git repository that every Shed product repository installs. It holds the principles agents apply while deciding, the engineering conventions every Shed repo shares, the playbooks, the template files those playbooks copy, the ADRs that record why a locked behaviour exists, and the stack packs under [`stacks/`](stacks/). Everything lives in this repository so a Cursor Cloud Agent can read it with a git checkout and nothing else.

[PURPOSE.md](PURPOSE.md) states what neat-os is for. A director owns it, and it changes only by pull request.

`init` leaves an empty stack-pack slot. `gather` points a product repo at the matching pack. Tool-specific knowledge will live in separate `neat-os-tool-*` repositories later. They are not part of this one. Together with neat-os they are the OS repos. Everything else at Shed is a product repo.

It is also the agency rulebook for shared operations playbooks. Living operational state stays in a private operations repository; the rules and playbooks stay here ([docs/agency-ops.md](docs/agency-ops.md)).

## How it fits together

A product repository pins a neat-os release. `init` copies templates into `AGENTS.md` and an `.agents/` folder. Agents read those files and follow them. The package itself stays in the install (`node_modules/` or a sibling checkout). It is not copied in as those files.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/diagram-how-it-fits-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/assets/readme/diagram-how-it-fits-light.svg">
    <img alt="Diagram: neat-os (principles, ADRs, playbooks and skills, stack packs) is installed into your product repo from a pinned release; init then copies the AGENTS.md and .agents/ templates into the repo. AI coding agents read those files and follow them." src="docs/assets/readme/diagram-how-it-fits-light.svg" width="100%">
  </picture>
</p>

## Goals

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/concept-1-three-goals-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/assets/readme/concept-1-three-goals-light.svg">
    <img alt="Three goals, one cube per principle, 12 principles in all. Kaizen, improve from shipped work (4): Encode lessons; Smallest complete change; Propose, never promote; Keep the guide true. Determinism, same inputs, trusted results (6): Evidence before done; Never invent facts; Inspect before inventing; Red is a stop; Use the declared runtime; Enqueue side effects. Parallelism, independent workers at once (2): Keep human gates; Surface conflicts." src="docs/assets/readme/concept-1-three-goals-light.svg" width="100%">
  </picture>
</p>

| Goal | Meaning |
| --- | --- |
| [Kaizen](principles/kaizen.md) | Improve the system from shipped work, in small steps |
| [Determinism](principles/determinism.md) | The same inputs give tested, trusted results |
| [Parallelism](principles/parallelism.md) | Independent workers, including Cloud Agents, can run at once |

Each goal has a few one-line principles beneath it. The index is [principles/README.md](principles/README.md).

## Building blocks

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/concept-2-building-blocks-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/assets/readme/concept-2-building-blocks-light.svg">
    <img alt="Five building blocks on a spectrum from judgement to deterministic code: Principle, one judgement rule; Convention, a locked fact, same in every repo; Playbook, ordered steps with a stop point; Skill, one capability, run on demand; Script, deterministic code owns green, and is preferred: anything software can prevent becomes a script. The coding agent sits above the spectrum and follows all five. Not building blocks: project knowledge lives in the product repo; decisions live as ADRs. A sixth kind, reviewer agents, is planned." src="docs/assets/readme/concept-2-building-blocks-light.svg" width="100%">
  </picture>
</p>

The six kinds of mechanism are defined in [schema/README.md](schema/README.md). Project knowledge lives in the product repository. New architecture decision records are paused until v1 ([docs/decisions/](docs/decisions/README.md)). Reviewer agents are not in the tree yet.

## Two ways in

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/concept-4-two-ways-in-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/assets/readme/concept-4-two-ways-in-light.svg">
    <img alt="Both ways start from neat-os, as a pinned release or a sibling checkout. Local IDE: the package is installed and lands in the product repo's node_modules/ folder. Cloud agent: neat-os is cloned beside the product repo as ../neat-os. Both paths end at the same playbooks." src="docs/assets/readme/concept-4-two-ways-in-light.svg" width="100%">
  </picture>
</p>

Pin a release tag (`#vX.Y.Z`) for a product repository. `#develop` is for unreleased work. How a release happens is in [docs/release.md](docs/release.md). First install, moving an existing install, and moving from shed-os are in [docs/consume.md](docs/consume.md), and nowhere else.

### On your computer, in the Cursor IDE

1. In the product repository root, add the dependency to `package.json` and run `npm install`. If `@shedcollective/neat-os` is already in `package-lock.json`, use the move steps in [docs/consume.md](docs/consume.md) instead:

   ```json
   "@shedcollective/neat-os": "git+ssh://git@github.com/shedcollective/neat-os.git#vX.Y.Z"
   ```

   The package lands in `node_modules/@shedcollective/neat-os`. A PHP project adds the Node dependency too. The Composer package carries metadata only.

2. Open the repository in Cursor and ask the agent to run the first two playbooks. Give it the client and product so `gather` can finish:

   ```text
   Follow node_modules/@shedcollective/neat-os/skills/init/SKILL.md, then
   node_modules/@shedcollective/neat-os/skills/gather/SKILL.md.
   Client: Acme. Product: the marketing WordPress site.
   ```

3. You should see `AGENTS.md` and an `.agents/` folder in the repository, with Client and Product filled in `.agents/project.md`.

### In a Cloud Agent

1. Ask a team admin for a Cloud Agent Environment that contains the product repository and `shedcollective/neat-os`. Why both are needed is explained in [docs/cursor-environments.md](docs/cursor-environments.md).
2. Start the agent from that Environment. neat-os is cloned beside the product repository as `../neat-os`, and the playbooks find it there. `SHED_OS_ROOT` and a sibling named `../shed-os` still resolve, and each prints a deprecation warning.
3. Prompt as in the computer steps, with the path `../neat-os/skills/init/SKILL.md`. Include the client and product in the prompt. A Cloud Agent cannot interview you, so without them `gather` stops and reports itself incomplete.

## Adoption and the improvement loop

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/concept-3-adoption-loop-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/assets/readme/concept-3-adoption-loop-light.svg">
    <img alt="Adopt once: a person installs (pins a release tag), init (copy the templates into AGENTS.md and a .agents/ folder), gather (scan the repo plus a short interview). Then improve continuously in a loop: work, where agents follow it; learn drafts proposals; a person opens a PR to neat-os and a person merges it; a person tags a release on main; each product repo moves its own pin (new tag plus lockfile), then back to work. Releases do not flow back automatically. Grey cubes mark the steps a person does." src="docs/assets/readme/concept-3-adoption-loop-light.svg" width="100%">
  </picture>
</p>

Adopt once: a person pins a release, then runs `init`, then `gather`. After that, agents follow the files while they work. `learn` drafts proposals. A person opens the pull request that would elevate one, and a person merges it. A person tags a release on `main`. Each product repository moves its own pin. A release does not flow back into product repositories on its own.

## The playbooks

The playbooks are listed in [skills/README.md](skills/README.md). What the launch playbooks and `ticket` do is described in [docs/launch-skills.md](docs/launch-skills.md). Agency operations playbooks are mapped in [docs/agency-ops.md](docs/agency-ops.md). Design and UX rules are [conventions/design-ux-agents.md](conventions/design-ux-agents.md).

`daily-digest` turns the day file into a short end-of-day post for a team channel. `morning-brief` composes one morning message per person and replaces separate morning health, digest, day-plan, and meeting-prep brief messages. Agency operations playbooks take their inputs from the settings in [conventions/routine-settings.md](conventions/routine-settings.md).

## Releases and pinning

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/concept-5-releases-pinning-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/assets/readme/concept-5-releases-pinning-light.svg">
    <img alt="Work happens on develop. A release/X.Y.Z branch is cut from develop and merged into main by a person, who publishes the vX.Y.Z GitHub Release. The notes are the merged pull request titles, plus a migration note when consumers must change something. Product repos pin a tag (or #develop for unreleased work), so several repos can sit on different tags: in the example, repo A is on v1.0.0, repo B on v1.1.0 and repo C on v1.2.0. A person moves a pin by hand: new tag, update the dependency, commit the lockfile. Grey cubes mark steps a person does." src="docs/assets/readme/concept-5-releases-pinning-light.svg" width="100%">
  </picture>
</p>

Work lands on `develop`. A release-prep pull request sets the version. Prepare release opens `release/X.Y.Z` into `main` and a draft Release. A person merges that pull request with a merge commit and publishes the draft. The Release notes are the merged pull request titles, plus a migration note when consumers must change something. Product repositories pin that tag. `#develop` is for unreleased work. Several product repositories can sit on different tags. A person moves a pin by changing the tag, updating the dependency, and committing the lockfile. Node runs `npm update`. Composer runs `composer update`. The steps are in [docs/release.md](docs/release.md) and [docs/consume.md](docs/consume.md).

### Working on neat-os itself

1. Clone `shedcollective/neat-os`. You need Node 22 and bash. There is nothing to install.
2. Run `bash scripts/check`. It is the same command CI runs, and `npm test` is an alias for it.
3. Read the "Working in this checkout" section of [AGENTS.md](AGENTS.md#working-in-this-checkout), then [docs/contributing.md](docs/contributing.md).

## Documentation

| Page | What it covers |
| --- | --- |
| [PURPOSE.md](PURPOSE.md) | What neat-os is for |
| [docs/README.md](docs/README.md) | Where documentation lives and the full map |
| [docs/consume.md](docs/consume.md) | Installing neat-os in a product repository, moving an existing install, and moving from shed-os |
| [docs/launch-skills.md](docs/launch-skills.md) | What the launch playbooks and `ticket` do. The list of playbooks is [skills/README.md](skills/README.md) |
| [docs/cursor-environments.md](docs/cursor-environments.md) | The GitHub App, Cloud Agent Environments, and how they differ |
| [docs/team-setup.md](docs/team-setup.md) | Cursor and GitHub administration for the team |
| [docs/release.md](docs/release.md) | How neat-os is released on `shedcollective/neat-os`. Notes are on the GitHub Release |
| [docs/faq.md](docs/faq.md) | Problems we have hit and their fixes |
| [docs/contributing.md](docs/contributing.md) | How to change neat-os |
| [docs/decisions/](docs/decisions/README.md) | Why locked behaviour is the way it is. New records are paused until v1 |

Agents working in this repository read [AGENTS.md](AGENTS.md). The six kinds of mechanism that make up neat-os (principle, convention, playbook, skill, script, agent) are defined in [schema/README.md](schema/README.md). How pages are written is locked in [conventions/writing.md](conventions/writing.md). Prose comments are locked in [conventions/code-comments.md](conventions/code-comments.md).

## What neat-os does not do

- Agents do not install from GitHub Packages. An agent token gets a 403 from the registry. Agents install from a git pin (`github:shedcollective/neat-os#vX.Y.Z`) and need no registry token. The registry install for a product repository is in [docs/consume.md](docs/consume.md) ([ADR-0019](docs/decisions/0019-publish-github-packages.md)). The licence is MIT.
- `init` does not copy skills into a product repository's `.agents/skills/`. Agents read them from the installed package.
- Agents do not search the public web for how to install neat-os. The resolve order in [docs/consume.md](docs/consume.md) is the only way an agent looks for it.
- The archive tag `v0.0.1` predates a root `package.json` and cannot be installed. It is not a neat-os release. Do not pin it.
