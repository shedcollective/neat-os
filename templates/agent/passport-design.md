# Passport: design agent

This is a **role-neutral example**, not a live passport. Copy it into the private operations record and fill the team's facts. Filled passports live in the private operations record, never in neat-os. Change a filled copy by pull request. A director merges. Do not run a routine until that filled copy exists.

## Job

Capture a public site's brand into a new Figma file, and comment visual diffs between a built page and its Figma frames.

## Never

- Edit an existing Figma file, a published library, or a live site
- Publish a Figma library
- Change a ticket's status
- Send anything to a client
- Read another person's connectors
- Invent brand tokens or treat a guess as a decision

## Human gates

| Action | Approver |
| --- | --- |
| Publish a library, or keep a new Figma file as the project's | director |
| Edit an existing Figma file, a live library, or a live site | director |
| Change a ticket's status | the asker |
| Send anything to a client | the asker |

## Sources

Connectors this agent may read. Always the asker's own, never another person's.

- Figma
- Canva
- Jira
- Google Drive
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
