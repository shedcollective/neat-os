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

## Routines

| Name | Schedule | Timezone | Owner | Wrapper | Playbook |
| --- | --- | --- | --- | --- | --- |
| <routine> | <weekday and time> | <IANA zone> | <role> | <wrapper path> | <playbook> |

## Pin

The neat-os release tag this bot reads playbooks from. Pin a release tag (`vX.Y.Z`). `main` is a stopgap only. `develop` and other branches never.

`vX.Y.Z`

How to bump the tag is in [docs/consume.md](https://github.com/shedcollective/neat-os/blob/vX.Y.Z/docs/consume.md#move-a-wrapper-pin).

## Review

| Field | Value |
| --- | --- |
| Review date | <YYYY-MM-DD> |
| Passport owner | <role> |
