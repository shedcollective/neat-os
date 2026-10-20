# Project knowledge

Filled by **gather** (repo evidence + interview) after **init** scaffolds these slots, or by humans from known project truth. Agents must not invent answers.

**Gather is not complete** until interview fields (especially Client and Product) are filled. A scan-only passport is a start, not a finish.

Operational Agent Guide: [README.md](README.md). Canonical cross-IDE rules: [../AGENTS.md](../AGENTS.md). Platform leaves (when split): [platforms/](platforms/).

## Client & product

**Awaiting interview.** The evidence scan cannot name the client or product. `gather` is **not complete** until these are answered. Do not invent them. Docker/Make evidence belongs under Layout & start, not here.

- Client: awaiting interview
- Product (one paragraph): awaiting interview
- In scope / out of scope: awaiting interview
- Names or data that must not be renamed or exposed: awaiting interview

## Stack

- Languages / frameworks / versions:
- Package manager / lockfiles:
- Hosting / CI / deploy:

## Layout & start (repo evidence)

- App root(s): {{to confirm}}
- Containers / Compose: {{to confirm}}
- Makefile / task runner: {{to confirm}}
- How to start (from evidence): {{to confirm}}

## Existing notes

- Cited notes: {{to confirm}}

## Environment & workflow

- Git workflow: git-flow (company default — not a gather question)
- Integration branch (usually `develop`):
- Ticket prefix:
- Environments (local / staging / production): awaiting interview
- OS notes (macOS / WSL2): awaiting interview

## Tickets

Read by the `ticket` playbook when it creates or enhances a ticket. The shape and tone are company rules ([neat-os conventions/ticket-content.md](https://github.com/shedcollective/neat-os/blob/develop/conventions/ticket-content.md)); these bullets are what differs per project. Empty means none.

- Ticket site URL (Jira site, or the GitHub repo for an OS repo): awaiting interview
- Default labels or components on a new ticket: awaiting interview
- Client vocabulary (the client's names for environments, features, roles; e.g. "UAT" not "staging"): awaiting interview
- Standing acceptance criteria every ticket carries (each starting "Done when"): awaiting interview

## Improvements

Read by the `improve` playbook when it records an improvement on the live product. The record shape, the categories, and the sign-off rule are company rules ([neat-os conventions/improvement-record.md](https://github.com/shedcollective/neat-os/blob/develop/conventions/improvement-record.md)); these bullets are what differs per project. Empty means none, and the playbook falls back to the account owner as approver.

- Summary approver (the role that sets a record to approved; the account owner when empty): awaiting interview
- Measuring tools and where their reports are kept (for example a Lighthouse run in CI, an accessibility scanner): awaiting interview
- Analytics source for observed changes (the tool and who has access): awaiting interview
- Public use of improvement results (whether the client agreed, who agreed, and when; empty means not agreed): awaiting interview

## Company knowledge

How this project consumes neat-os (resolve and stop at the first hit: `NEAT_OS_ROOT`, then `github:shedcollective/neat-os#vX.Y.Z` or `file:../neat-os` → `node_modules/`, then Composer `shedcollective/neat-os` → `vendor/` which is PHP metadata only and does not ship skills/templates, then sibling `../neat-os`). Do not search the public web for neat-os. Do not copy skills into this repo. {{to confirm}}

## Gather next

`gather` is **not complete**. After the evidence scan, interview these; do not invent.

-
