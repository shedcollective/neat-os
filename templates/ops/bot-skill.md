---
name: <wrapper-name>
description: >-
  Use when <trigger: the schedule or the request that starts this run>. Runs
  the neat-os <playbook> playbook with the settings below.
---

# <Wrapper title>

1. Resolve `<neat-os-path>`. If that path is missing, say `neat-os is not at <neat-os-path>. Stop.` and stop. Do not search the web. Do not copy playbooks.
2. Check the pin (`vX.Y.Z`). A release tag: continue. `main`: say that this is a stopgap, then continue. `develop` or any other branch: say so and stop.
3. Confirm the checkout at `<neat-os-path>` is that pin (`git -C <neat-os-path> describe --tags --exact-match`). If the command fails or the tag does not match, say `neat-os at <neat-os-path> is not at vX.Y.Z. Stop.` and stop.
4. Follow `<neat-os-path>/skills/<playbook>/SKILL.md`. The public copy of that file at this pin is [`skills/<playbook>/SKILL.md`](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/skills/<playbook>/SKILL.md). Do not restate the playbook's steps here.

TODO: how neat-os is placed at `<neat-os-path>` is not this wrapper. Tracked in [issue #15](https://github.com/shedcollective/neat-os/issues/15).

The pin rule is [conventions/routine-settings.md](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/conventions/routine-settings.md). How to bump the tag is [docs/consume.md](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/docs/consume.md#move-a-wrapper-pin). [ADR-0022](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/docs/decisions/0022-wrapper-shared-path.md).

## Settings

Names and meanings are in [conventions/routine-settings.md](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/conventions/routine-settings.md). Delete rows the playbook does not use. Add the playbook's own settings below them.

| Setting | Value |
| --- | --- |
| `<neat-os-path>` | `/<shared>/neat-os` |
| `<ops-record>` | `<org>/<ops-repo>` |
| `<timezone>` | `<IANA zone>` |
| `<destination>` | `<the asker's chat, or #<channel>>` |
| `<tracker-host>` | `<ticket system base URL>` |
| `<connectors>` | The asker's own |
| `<write-rule>` | `<for example: day file and in-flight board to the default branch; clients/ by pull request>` |
| `<quiet-when-empty>` | `<yes or no>` |

Credentials are referenced by environment variable name only, for example `<TOKEN_ENV_VAR>`. Never write a value here.

## Local rules

At most five. Only rules that are true for this team and not for every team. A rule every team needs belongs in neat-os.

- <local rule>
