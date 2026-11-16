---
name: <wrapper-name>
description: >-
  Use when <trigger: the schedule or the request that starts this run>. Runs
  the neat-os <playbook> playbook with the settings below.
---

# <Wrapper title>

1. Resolve `<neat-os-path>`. If that path is missing, say `neat-os is not at <neat-os-path>. Stop.` and stop. Do not search the web. Do not copy playbooks. Do not read a saved copy or a copy in this agent's skill store.
2. If the checkout is not on `main` (`git -C <neat-os-path> rev-parse --abbrev-ref HEAD`), say `neat-os at <neat-os-path> is not on main. Stop.` and stop.
3. If `HEAD` is not the latest release tag (the first line of `git -C <neat-os-path> tag -l 'v*' --sort=-v:refname`), say `neat-os at <neat-os-path> is behind the latest release. Stop.` and stop. Do not fetch. Do not pull or fast-forward the checkout.
4. Follow `<neat-os-path>/skills/<playbook>/SKILL.md`. Do not restate the playbook's steps here.
5. Write `neat-os vX.Y.Z (sha)` in the file, not in chat. `vX.Y.Z` is `git -C <neat-os-path> describe --tags --exact-match`. `sha` is `git -C <neat-os-path> rev-parse --short HEAD`.

The rule is `<neat-os-path>/conventions/routine-settings.md`. How the checkout stays current is `<neat-os-path>/docs/consume.md`. The agent's configuration holds `<neat-os-path>` and no playbook text.

Before writing to a repo or an operations record outside a playbook run (a passport or wrapper edit, a doc edit, a commit, or a pull request), read `AGENTS.md`, `conventions/writing.md`, `conventions/attribution.md`, and `conventions/ticket-content.md` from `/home/box/shared/neat-os` and follow them. State present-tense facts only. Do not record who did it or an approval history. Do not hard-code a current version. The commit author is the person driving the session.

## Settings

Names and meanings are in `<neat-os-path>/conventions/routine-settings.md`. Delete rows the playbook does not use. Add the playbook's own settings below them.

| Setting | Value |
| --- | --- |
| `<neat-os-path>` | `/home/box/shared/neat-os` |
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
