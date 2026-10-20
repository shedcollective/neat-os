# Agency operations

neat-os is the agency rulebook for Shed agents, not only the coding-agent install. Coding playbooks (`init`, `gather`, `learn`, `ticket`, `assurance`, `pin-majors-with-reasons`) adopt and run product repositories. The playbooks on this page cover shared **operations** work: day digests, perspective add-ons, project status, and client briefs.

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
| [`project-update`](../skills/project-update/SKILL.md) | Produces a short project status from the operations record and live connectors. | Invent project facts. Post externally without approval. |
| [`client-brief`](../skills/client-brief/SKILL.md) | Assembles a high-level client brief with no billing figures. | Write amounts, rates, or credentials into the brief. |

## Template

| File | Job |
| --- | --- |
| [templates/ops/burndown-day.md](../templates/ops/burndown-day.md) | Day-file shape: Agency state first, then project sections with `####` activity headings, Agency, Sources unavailable. One shared body; perspective runs append into those project sections. Copy into the private operations record, or point the playbook at this path in the neat-os install. |

## Order

A weekday overview run follows `daily-burndown`. Perspective add-ons follow `enhance-daily-update` after the shared body exists. `project-update` and `client-brief` run on demand. Elevating further agency rules into this repository is a human pull request ([propose-never-promote](../principles/propose-never-promote.md)).
