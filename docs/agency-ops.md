# Agency operations

neat-os is the agency rulebook for Shed agents, not only the coding-agent install. Coding playbooks (`init`, `gather`, `learn`, `ticket`, `assurance`, `pin-majors-with-reasons`) adopt and run product repositories. The playbooks on this page cover shared **operations** work: day digests, morning briefs, perspective add-ons, project status, client briefs, meeting preparation, the bids register, and director finance lookups.

Living operational state (day files, in-flight boards, client folders) stays in a **private** operations repository. This public repository holds the locked rules and the playbooks only. Nothing sensitive belongs here: no client names, no client projects, no internal chat, no billing figures, and no credentials ([neutral-reference.md](../conventions/neutral-reference.md), [never-store-secrets.md](../conventions/never-store-secrets.md), [agent-work-logging.md](../conventions/agent-work-logging.md)). A personal name and an authorship line may appear. Who a commit names is [attribution.md](../conventions/attribution.md).

## Convention

| Convention | File |
| --- | --- |
| What may be written into a shared work digest | [agent-work-logging.md](../conventions/agent-work-logging.md) |
| The setting names a routine supplies to every playbook on this page | [routine-settings.md](../conventions/routine-settings.md) |

## Playbooks

| Playbook | Does | Refuses to |
| --- | --- | --- |
| [`daily-burndown`](../skills/daily-burndown/SKILL.md) | Writes the shared day body (Agency state first, then **by project** by default, Agency, Sources unavailable) into the private operations record and refreshes the in-flight board. A passport may name other top-level sections. | Log personal chatter, billing amounts, secrets, or invented leave. Invent missing sources. Invent a heading the passport did not name. |
| [`enhance-daily-update`](../skills/enhance-daily-update/SKILL.md) | Appends detail from one perspective into the sections the passport named, or into the default `###` project sections. | Invent a heading the passport did not name. Use another person's private connectors. Duplicate overview points. |
| [`daily-digest`](../skills/daily-digest/SKILL.md) | Distils the day file into a short end-of-day post (notable projects, People, Tomorrow) and delivers it to `<destination>`. Not the morning brief. | Post a code block. Write a bare deadline with no context. List unverified leave. Include amounts. |
| [`morning-brief`](../skills/morning-brief/SKILL.md) | Composes one morning message per person, in a fixed order: Needs you, Today, Meetings, Health, Pipeline (Mondays). Adds no new facts. Replaces separate morning health, digest, day-plan, and meeting-prep brief messages. | Invent a line. Delay a red production alert. Also send the old separate morning messages. Pad an empty section. |
| [`project-update`](../skills/project-update/SKILL.md) | Produces a short project status from the operations record and live connectors. | Invent project facts. Post externally without approval. |
| [`client-brief`](../skills/client-brief/SKILL.md) | Assembles a high-level client brief with no billing figures. | Write amounts, rates, or credentials into the brief. |
| [`meeting-prep`](../skills/meeting-prep/SKILL.md) | On demand, briefs one person for a named meeting (mode `brief`). `morning-brief` uses that composition for its Meetings section. Mode `proposals` drafts numbered ticket proposals from the transcript (run by anyone's agent by default, with a tracker dedupe search so a meeting is never applied twice). | Apply a ticket change the person has not approved. Send a separate morning brief. Send anything outside `<destination>`. Name the person in their own brief. Guess an owner. Apply a proposal that already exists. List an owed action without checking its ticket. |
| [`bids-register`](../skills/bids-register/SKILL.md) | Daily idempotent register of submitted bids plus a folder of the redacted files that were sent. Owned by the operations lead. | Commit credentials, portal logins, tokens, the zip, or a full financial or accounts package. Invent a row. Rewrite an unchanged bid. |
| [`finance-client-backfill`](../skills/finance-client-backfill/SKILL.md) | Creates missing client records in the director's accounting tool from the operations record. Tool name, token, and account stay in the passport. | Write a token. Invent a client. Use another director's account. |
| [`finance-client-sync`](../skills/finance-client-sync/SKILL.md) | Weekly sync of client records between the operations record and the accounting tool. | Write a token. Delete a client. Copy amounts into a shared file. |
| [`finance-lookup`](../skills/finance-lookup/SKILL.md) | Looks up a client, invoice, or balance for a director. | Write a token. Invent a figure. Copy amounts into a shared digest. |

## Template

| File | Job |
| --- | --- |
| [templates/ops/burndown-day.md](../templates/ops/burndown-day.md) | Default day-file shape: Agency state first, then project sections with `####` activity headings, Agency, Sources unavailable. A passport may name other top-level sections. Copy into the private operations record, or point the playbook at this path in the neat-os install. |
| [templates/ops/bot-skill.md](../templates/ops/bot-skill.md) | Thin wrapper a person's agent uses to run one playbook: trigger, the playbook at `<neat-os-path>` and a pinned tag, a settings table ([routine-settings.md](../conventions/routine-settings.md)), and at most five local rules. |
| [templates/agent/passport.md](../templates/agent/passport.md) | One-screen bot passport: Job, Never, Human gates, Sources, Skills, Routines, Day file, Pin, Review. Copy into the private operations record. Every team bot has a filled passport before it runs a routine ([team-setup.md](team-setup.md#team-bots)). Role-neutral examples: [passport-design.md](../templates/agent/passport-design.md), [passport-ux.md](../templates/agent/passport-ux.md). |
| [templates/ops/bids-register.md](../templates/ops/bids-register.md) | Register shape: one row per submitted bid. |
| [templates/ops/bid-submission.md](../templates/ops/bid-submission.md) | Per-bid `submission.md`: date, portal, reference, version, zip sha256, who submitted, status. |

## Routines

Each person runs these playbooks from their own agent through a thin wrapper ([templates/ops/bot-skill.md](../templates/ops/bot-skill.md)) that supplies the settings in [routine-settings.md](../conventions/routine-settings.md). The wrapper pins a release tag and reads playbooks from `<neat-os-path>` ([routine-settings.md](../conventions/routine-settings.md), [ADR-0021](decisions/0021-wrapper-release-tag-pins.md), [ADR-0022](decisions/0022-wrapper-shared-path.md)). How to bump the tag is in [consume.md](consume.md#move-a-wrapper-pin). `morning-brief` is the weekday morning message: one per person, instead of separate health, digest, day-plan, and meeting-prep brief messages. `daily-digest` still runs after the day's `daily-burndown` and `enhance-daily-update` runs have written the day file. `bids-register` is a daily default-branch commit owned by the operations lead.

## Order

A weekday morning run follows `morning-brief` (including today's meeting briefs). A weekday overview run follows `daily-burndown`. Perspective add-ons follow `enhance-daily-update` after the shared body exists. `project-update`, `client-brief`, and `finance-lookup` run on demand. `meeting-prep` mode `proposals` still runs through the working day. `bids-register` runs daily against the default branch. Elevating further agency rules into this repository is a human pull request ([propose-never-promote](../principles/propose-never-promote.md)).
