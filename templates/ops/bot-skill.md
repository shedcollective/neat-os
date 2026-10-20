---
name: <wrapper-name>
description: >-
  Use when <trigger: the schedule or the request that starts this run>. Runs
  the neat-os <playbook> playbook with the settings below.
---

# <Wrapper title>

Follow [`skills/<playbook>/SKILL.md`](https://github.com/shedcollective/neat-os/blob/<ref>/skills/<playbook>/SKILL.md) at `<ref>`. Pin `main` or a release tag, not `develop`. Do not restate its steps here.

## Settings

Names and meanings are in [conventions/routine-settings.md](https://github.com/shedcollective/neat-os/blob/<ref>/conventions/routine-settings.md). Delete rows the playbook does not use. Add the playbook's own settings below them.

| Setting | Value |
| --- | --- |
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
