# Passport: <role>

A filled bot passport lives in the private operations record, never in neat-os. Change it by pull request. A director merges. Do not run a routine until this page is filled.

## Job

<one line: what this bot does>

## Never

- <refusal>

## Human gates

| Action | Approver |
| --- | --- |
| <what a person approves> | <role> |

## Sources

Connectors this bot may read. Always the asker's own, never another person's.

- <connector>

## Skills

One row per skill this bot may run. Kind is **OS playbook**, **passport enhancement**, or **bot-only**.

| Skill | Kind |
| --- | --- |
| `<playbook>` | OS playbook |
| `<enhancement>` | passport enhancement |
| `<local>` | bot-only |

- **OS playbook**: a `skills/<name>/SKILL.md` in neat-os at the pin. The wrapper follows it as written.
- **passport enhancement**: an OS playbook plus extra steps or settings that are true only for this bot. Those extras live in this passport or in the wrapper's Local rules. Do not copy the playbook.
- **bot-only**: a skill that is not an OS playbook. It lives with this bot. Do not copy it into neat-os from here.

## Routines

Install only the rows whose Owner is this passport's owner. Do not install another owner's routines into this agent.

A routine is identified by **owner**, **name**, and **schedule**. Skip a row when a wrapper for that triple already exists. Two passports never share a wrapper path. If two rows would write the same wrapper path, keep the first and say so.

| Name | Schedule | Timezone | Owner | Wrapper | Playbook |
| --- | --- | --- | --- | --- | --- |
| <routine> | <weekday and time> | <IANA zone> | <role> | <wrapper path> | <playbook> |

## Day file

The default day shape is [templates/ops/burndown-day.md](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/templates/ops/burndown-day.md): Agency state first, then by project, Agency, Sources unavailable. A passport may replace the project block with its own top-level sections, for example by discipline. Agency state stays first. Sources unavailable stays last. Leave the table empty to keep the default.

| Heading | Meaning |
| --- | --- |

## Pin

The neat-os release tag this bot reads playbooks from. Pin a release tag (`vX.Y.Z`). `main` is a stopgap only. `develop` and other branches never.

`vX.Y.Z`

How to bump the tag is in [docs/consume.md](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/docs/consume.md#move-a-wrapper-pin). The wrapper reads that pin from `<neat-os-path>` ([ADR-0022](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/docs/decisions/0022-wrapper-shared-path.md)).

## Review

| Field | Value |
| --- | --- |
| Review date | <YYYY-MM-DD> |
| Passport owner | <role> |
