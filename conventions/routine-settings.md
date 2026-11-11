# Routine settings

**Locked:** every agency operations playbook names its inputs with the settings on this page. A playbook supplies the steps. The routine or wrapper that runs it supplies only these values.

A wrapper is the short file in a person's agent that says which playbook to run and fills in these settings. Its shape is [templates/ops/bot-skill.md](../templates/ops/bot-skill.md). A wrapper does not restate a playbook's steps. When a wrapper needs a rule that is true for every team, propose it here instead ([propose-never-promote](../principles/propose-never-promote.md)).

## Settings

| Setting | Meaning | Example |
| --- | --- | --- |
| `<ops-record>` | The private operations repository the playbook reads and writes: day files, the in-flight board, client folders. | `<org>/<ops-repo>` |
| `<timezone>` | The team's IANA timezone. Dates are resolved and times are shown in it. | `Europe/London` |
| `<destination>` | Where the output is delivered: the asker's chat, or a named channel. | `#<channel>` |
| `<tracker-host>` | Base URL of the ticket system, used to link every ticket key. | `https://tickets.example.com` |
| `<connectors>` | The sources the playbook may read. Always the asker's own connected accounts, never another person's. | calendar, mail, chat, tickets, version control |
| `<write-rule>` | How changes reach `<ops-record>`. | Day file and in-flight board: commit to the default branch. `clients/`: pull request, a director merges. |
| `<quiet-when-empty>` | Whether a run with nothing to report stays silent (`yes`) or writes an explicit empty stub (`no`). | `yes` |
| `<neat-os-path>` | Absolute path of the one shared neat-os checkout on this computer. The checkout is on `main`. | `/home/box/shared/neat-os` |

A playbook may add its own settings, such as a prep tag or a log path. It lists them in a Settings table and uses these names for everything the table above covers.

## Rules

- A missing required setting is asked for once, then the run stops ([never-invent-facts](../principles/never-invent-facts.md)).
- Settings hold values, not secrets. A credential is referenced by the name of an environment variable and never written into a wrapper ([never-store-secrets.md](never-store-secrets.md)).
- Real values (the repository, the channel, the host) live in the wrapper or the private operations record, never in this repository ([neutral-reference.md](neutral-reference.md)).
- `main` is the source of truth. It always equals the latest release tag, and only a release is merged to it. A team or personal agent does not pin a tag. A product repository still pins a release tag ([docs/consume.md](../docs/consume.md#move-to-a-new-tagged-release)).
- Each computer has one shared checkout of neat-os on `main`. Exactly one named maintainer on that computer fetches and fast-forwards it at midnight local time and when a release lands, with `git fetch --tags --prune` and then a fast-forward of `main`. That maintainer never commits to the checkout. The steps are in [docs/consume.md](../docs/consume.md#agents).
- Every other team or personal agent only reads playbooks from that checkout. It never fetches, pulls, or fast-forwards the checkout, and it keeps no copy of its own. A saved copy, a copy in an agent's skill store, and an ad-hoc web fetch are not allowed ([ADR-0004](../docs/decisions/0004-ide-spread-no-skill-copy.md)). The agent's configuration holds `<neat-os-path>` and no playbook text.
- Every output records `neat-os vX.Y.Z (sha)` in the file, not in chat.
- If the checkout is missing, off `main`, or behind the latest release, the agent says so and stops for that run. It does not fall back to a saved copy or a web search.

## Why

`main` is already the release, so a second pin per agent would copy the tag and then go stale. A saved copy, a copy in a skill store, and a fetch during the run go stale in the same way, and a copy cannot be checked ([ADR-0004](../docs/decisions/0004-ide-spread-no-skill-copy.md)).

Not chosen: one release tag per agent, moved by a pull request, canary first ([issue #15](https://github.com/shedcollective/neat-os/issues/15)). A release would then need a change in every agent, and more than one version would run at once. The cost here is that a bad release reaches every agent once the named maintainer fast-forwards. The fix is a revert on `main` and a fast-forward when that revert lands. There is no canary.

[ADR-0021](../docs/decisions/0021-wrapper-release-tag-pins.md) and [ADR-0022](../docs/decisions/0022-wrapper-shared-path.md) stay as history. This page is the rule. New records are paused until v1 ([docs/decisions/README.md](../docs/decisions/README.md)).
