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
| `<neat-os-path>` | Absolute path of the shared neat-os checkout this wrapper reads. | `/<shared>/neat-os` |

A playbook may add its own settings, such as a prep tag or a log path. It lists them in a Settings table and uses these names for everything the table above covers.

## Rules

- A missing required setting is asked for once, then the run stops ([never-invent-facts](../principles/never-invent-facts.md)).
- Settings hold values, not secrets. A credential is referenced by the name of an environment variable and never written into a wrapper ([never-store-secrets.md](never-store-secrets.md)).
- Real values (the repository, the channel, the host) live in the wrapper or the private operations record, never in this repository ([neutral-reference.md](neutral-reference.md)).
- A wrapper names the ref it reads playbooks from. Pin a release tag (`vX.Y.Z`). `main` is a stopgap only. `develop` and other branches never. An unreleased change must not alter a live routine. After a release, bump the tag as in [docs/consume.md](../docs/consume.md#move-a-wrapper-pin).
- A wrapper follows playbooks from `<neat-os-path>` at that pin ([ADR-0022](../docs/decisions/0022-wrapper-shared-path.md)). If the path is missing, or the checkout is not the pin, the run stops with that reason. It does not search the web and it does not copy playbooks. How the path is populated is not this convention ([issue #15](https://github.com/shedcollective/neat-os/issues/15)).
