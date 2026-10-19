# Documentation

This repository is the source of truth for how neat-os works, why it works that way, and how it is released. Discussion happens in GitHub Issues, changes arrive as pull requests, and decisions are recorded under [decisions/](decisions/README.md). Notes kept anywhere else are drafts until they are written here, and no page in this repository links out to them ([ADR-0008](decisions/0008-repo-is-source-of-truth.md)).

Each page does one job. If two pages seem to say the same thing, one of them is wrong and should point at the other instead.

| Page | Job |
| --- | --- |
| [consume.md](consume.md) | Install neat-os in a product repository, move an existing install, and move from shed-os. The only place the install recipes appear. |
| [launch-skills.md](launch-skills.md) | What `init`, `gather`, `learn`, and `ticket` each do, and where `assurance` and `pin-majors-with-reasons` live |
| [agency-ops.md](agency-ops.md) | Agency operations playbooks and the work-logging convention; private record stays out of this tree |
| [cursor-environments.md](cursor-environments.md) | The Cursor GitHub App, Cloud Agent Environments, and the install, kept apart |
| [team-setup.md](team-setup.md) | Cursor team and GitHub organisation settings, and the steps for a new or existing project |
| [release.md](release.md) | How a change on `develop` becomes a tagged release on `main` |
| [faq.md](faq.md) | Problems we have hit, with the fix for each |
| [contributing.md](contributing.md) | How to change neat-os: branching, the required check, and which kind of file to add |
| [decisions/](decisions/README.md) | Architecture decision records. Why a locked behaviour exists |

Start at the root [README.md](../README.md). Agents working in this repository read [AGENTS.md](../AGENTS.md). How these pages are written is locked in [conventions/writing.md](../conventions/writing.md).
