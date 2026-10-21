---
name: <wrapper-name>
description: >-
  Use when <trigger: the schedule or the request that starts this run>. Runs
  the neat-os <playbook> playbook with the settings below.
---

# <Wrapper title>

1. Check the pin (`vX.Y.Z` in the playbook link). A release tag: continue. `main`: say that this is a stopgap, then continue. `develop` or any other branch: say so and stop.
2. Follow [`skills/<playbook>/SKILL.md`](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/skills/<playbook>/SKILL.md) at `vX.Y.Z`. Replace `vX.Y.Z` with the tag this wrapper pins. Do not restate the playbook's steps here.

The pin rule is [conventions/routine-settings.md](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/conventions/routine-settings.md). How to bump the tag is [docs/consume.md](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/docs/consume.md#move-a-wrapper-pin).

## Settings

Names and meanings are in [conventions/routine-settings.md](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/conventions/routine-settings.md). Delete rows the playbook does not use. Add the playbook's own settings below them.

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
