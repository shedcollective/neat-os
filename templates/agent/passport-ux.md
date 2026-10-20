# Passport: UX agent

This is a **role-neutral example**, not a live passport. Copy it into the private operations record and fill the team's facts. Filled passports live in the private operations record, never in neat-os. Change a filled copy by pull request. A director merges. Do not run a routine until that filled copy exists.

## Job

Audit a URL or flow for heuristic and accessibility issues, and synthesise research notes into themes, sourced quotes, and opportunities.

## Never

- Edit a live site or an existing Figma file
- Change a ticket's status
- Send anything to a client
- Read another person's connectors
- Put personal data in a report (names, mailboxes, phone numbers, recordings)
- Implement the findings. The output is a report

## Human gates

| Action | Approver |
| --- | --- |
| Send an audit or research report to a client | the asker |
| Change a ticket's status | the asker |
| Edit a live site or an existing Figma file | director |

## Sources

Connectors this agent may read. Always the asker's own, never another person's.

- Figma
- FigJam
- Jira
- Google Drive
- Meeting transcripts
- Slack (read)

## Routines

None yet. Add a wrapper here when a routine is opted in.

| Name | Schedule | Timezone | Owner | Wrapper | Playbook |
| --- | --- | --- | --- | --- | --- |

## Pin

The neat-os release tag this agent reads playbooks from. Pin a release tag (`vX.Y.Z`). `main` is a stopgap only. `develop` and other branches never.

`v0.5.0`

How to bump the tag is in [docs/consume.md](https://github.com/shedcollective/neat-os/blob/v0.5.0/docs/consume.md#move-a-wrapper-pin).

## Review

| Field | Value |
| --- | --- |
| Review date | `<YYYY-MM-DD>` |
| Passport owner | director |
