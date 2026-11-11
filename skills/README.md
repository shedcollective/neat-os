# Playbooks

Each folder under `skills/` is one playbook. This page is the list.

`scripts/check-structure.js` fails when a folder here has no row, or a row points at a folder that is not there.

## Adoption

Adoption playbooks (`init`, `gather`, `learn`) bring a repository into neat-os ([ADR-0002](../docs/decisions/0002-launch-skill-split.md)).

| Playbook | Purpose |
| --- | --- |
| [init](init/SKILL.md) | Copies the agent guide and project slots into a repository and leaves the placeholders empty. |
| [gather](gather/SKILL.md) | Fills those files from repository evidence, then interviews for what the tree cannot show. |
| [learn](learn/SKILL.md) | Reads recent commits and drafts proposals for a shared principle or playbook. A person opens the pull request. |

## On demand

| Playbook | Purpose |
| --- | --- |
| [assurance](assurance/SKILL.md) | Reads one pull request and posts an evidence pack. Does not implement, push, approve, or merge. |
| [bids-register](bids-register/SKILL.md) | Keeps a register of bids by stage, and a folder of the redacted files that were sent. |
| [brand-board-from-assets](brand-board-from-assets/SKILL.md) | Builds a brand board in a new Figma file from brand asset files. Does not publish a library. |
| [brand-from-site](brand-from-site/SKILL.md) | Captures a public website's brand into a new Figma file. Does not edit an existing file. |
| [client-brief](client-brief/SKILL.md) | Assembles a high-level client brief from the private operations record. Includes no billing figures. |
| [daily-burndown](daily-burndown/SKILL.md) | Writes the day's work digest into the private operations record and refreshes the in-flight board. |
| [daily-digest](daily-digest/SKILL.md) | Turns the day's digest into a short end-of-day post and delivers it. |
| [design-brief](design-brief/SKILL.md) | Collects brand, audience, format, deadline, and sources for a design request, and checks the asker's Figma seat. |
| [design-handoff](design-handoff/SKILL.md) | Puts the chosen option on the Jira ticket, with the Figma link, PNGs, and spec. |
| [design-qa](design-qa/SKILL.md) | Compares a built page with its Figma frames and comments on the differences. Belongs to the assurance role. |
| [enhance-daily-update](enhance-daily-update/SKILL.md) | Appends one person's perspective to the day's shared digest. |
| [finance-client-backfill](finance-client-backfill/SKILL.md) | Creates missing client records in the director's accounting tool from the private operations record. |
| [finance-client-sync](finance-client-sync/SKILL.md) | Syncs client records between the private operations record and the director's accounting tool. |
| [finance-lookup](finance-lookup/SKILL.md) | Looks up a client, invoice, or balance in the director's accounting tool. |
| [meeting-prep](meeting-prep/SKILL.md) | Prepares one person for a meeting, or drafts ticket proposals from a transcript for that person to approve. |
| [mockup](mockup/SKILL.md) | Turns a design brief into 2 to 3 Figma options and recommends one. |
| [morning-brief](morning-brief/SKILL.md) | Composes one morning message per person from existing facts. |
| [naming-and-voice](naming-and-voice/SKILL.md) | Proposes 2 to 3 naming options and tone-of-voice drafts, and recommends one. |
| [ops-capture](ops-capture/SKILL.md) | Captures new email, shared threads, applied meeting proposals, and stated decisions into the private operations record. |
| [pin-majors-with-reasons](pin-majors-with-reasons/SKILL.md) | Upgrades dependencies and leaves a pinned major where it is. |
| [project-update](project-update/SKILL.md) | Writes a short project status from the operations record and live connectors. |
| [release](release/SKILL.md) | Cuts a git-flow release on a product repository from the Release slot, then stops before the production deploy. Runs only when a person names it. |
| [research-synthesis](research-synthesis/SKILL.md) | Turns interview notes into themes, sourced quotes, and opportunities. |
| [ticket](ticket/SKILL.md) | Creates or updates a Jira task, or a GitHub Issue in an OS repository, and writes nothing to the repository. |
| [ux-audit](ux-audit/SKILL.md) | Reviews a whole user flow and reports ranked heuristic and accessibility findings. |
| [wireframes](wireframes/SKILL.md) | Turns a brief into an information architecture package and a clickable greyscale wireframe. |
