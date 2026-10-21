# Agency operations

neat-os is the agency rulebook for Shed agents, not only the coding-agent install. Coding playbooks (`init`, `gather`, `learn`, `ticket`, `assurance`, `pin-majors-with-reasons`) adopt and run product repositories. The playbooks on this page cover shared **operations** work: day digests, morning briefs, perspective add-ons, project status, client briefs, and meeting preparation.

Living operational state (day files, in-flight boards, client folders) stays in a **private** operations repository. This public repository holds the locked rules and the playbooks only. Nothing sensitive belongs here: no client names, no people, no internal project state, no billing figures, and no credentials ([neutral-reference.md](../conventions/neutral-reference.md), [never-store-secrets.md](../conventions/never-store-secrets.md), [agent-work-logging.md](../conventions/agent-work-logging.md)).

## Convention

| Convention | File |
| --- | --- |
| What may be written into a shared work digest | [agent-work-logging.md](../conventions/agent-work-logging.md) |
| The setting names a routine supplies to every playbook on this page | [routine-settings.md](../conventions/routine-settings.md) |

## Playbooks

| Playbook | Does | Refuses to |
| --- | --- | --- |
| [`daily-burndown`](../skills/daily-burndown/SKILL.md) | Writes the shared day body (Agency state first, then **by project**, Agency, Sources unavailable) into the private operations record and refreshes the in-flight board. | Log personal chatter, billing amounts, secrets, or invented leave. Invent missing sources. |
| [`enhance-daily-update`](../skills/enhance-daily-update/SKILL.md) | Appends detail from one perspective into the **same** `###` project sections, using that person's own connectors. | Introduce Front end / Back end / Perspective silos. Use another person's private connectors. Duplicate overview points. |
| [`daily-digest`](../skills/daily-digest/SKILL.md) | Distils the day file into a short end-of-day post (notable projects, People, Tomorrow) and delivers it to `<destination>`. Not the morning brief. | Post a code block. Write a bare deadline with no context. List unverified leave. Include amounts. |
| [`morning-brief`](../skills/morning-brief/SKILL.md) | Composes one morning message per person, in a fixed order: Needs you, Today, Health, Pipeline (Mondays). Adds no new facts. Replaces separate morning health, digest, and day-plan messages. | Invent a line. Delay a red production alert. Also send the old separate morning messages. Pad an empty section. |
| [`project-update`](../skills/project-update/SKILL.md) | Produces a short project status from the operations record and live connectors. | Invent project facts. Post externally without approval. |
| [`client-brief`](../skills/client-brief/SKILL.md) | Assembles a high-level client brief with no billing figures. | Write amounts, rates, or credentials into the brief. |
| [`meeting-prep`](../skills/meeting-prep/SKILL.md) | Briefs one person before each external or tagged meeting (mode `brief`), then drafts numbered ticket proposals from the transcript (mode `proposals`, run by anyone's agent by default, with a tracker dedupe search so a meeting is never applied twice). All company and account facts come from the person's routine settings. | Apply a ticket change the person has not approved. Send anything outside `<destination>`. Name the person in their own brief. Guess an owner. Apply a proposal that already exists. List an owed action without checking its ticket. |

## Template

| File | Job |
| --- | --- |
| [templates/ops/burndown-day.md](../templates/ops/burndown-day.md) | Day-file shape: Agency state first, then project sections with `####` activity headings, Agency, Sources unavailable. One shared body; perspective runs append into those project sections. Copy into the private operations record, or point the playbook at this path in the neat-os install. |
| [templates/ops/bot-skill.md](../templates/ops/bot-skill.md) | Thin wrapper a person's agent uses to run one playbook: trigger, the playbook at a pinned ref, a settings table ([routine-settings.md](../conventions/routine-settings.md)), and at most five local rules. |
| [templates/agent/passport.md](../templates/agent/passport.md) | One-screen bot passport: Job, Never, Human gates, Sources, Routines, Pin, Review. Copy into the private operations record. Every team bot has a filled passport before it runs a routine ([team-setup.md](team-setup.md#team-bots)). |

## Routines

Each person runs these playbooks from their own agent through a thin wrapper ([templates/ops/bot-skill.md](../templates/ops/bot-skill.md)) that supplies the settings in [routine-settings.md](../conventions/routine-settings.md). The wrapper pins a release tag ([routine-settings.md](../conventions/routine-settings.md), [ADR-0021](decisions/0021-wrapper-release-tag-pins.md)). How to bump the tag is in [consume.md](consume.md#move-a-wrapper-pin). `morning-brief` is the weekday morning message: one per person, instead of separate health, digest, and day-plan messages. `daily-digest` still runs after the day's `daily-burndown` and `enhance-daily-update` runs have written the day file.

## Order

A weekday morning run follows `morning-brief`. A weekday overview run follows `daily-burndown`. Perspective add-ons follow `enhance-daily-update` after the shared body exists. `project-update` and `client-brief` run on demand. Each person who wants meeting preparation runs `meeting-prep` from their own routine: `brief` before the day's meetings, `proposals` through the working day. Elevating further agency rules into this repository is a human pull request ([propose-never-promote](../principles/propose-never-promote.md)).
