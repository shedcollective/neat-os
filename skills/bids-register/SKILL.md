---
name: bids-register
description: >-
  Daily, event and weekly idempotent job: read bids from a pipeline API, a
  daily export, bid-running-agent run logs, or the bid-running agent's report,
  and keep a markdown register by stage plus a folder of the redacted files
  that were sent. Owned by the operations lead. Not a launch playbook.
---

# bids-register

Keep a markdown register of bids in `<ops-record>`, one row per bid from the moment the bid-running agent starts work on it, with a Stage from pursuing to an outcome. Keep a folder of the files that were actually sent, for each successful submission. The run is daily, also runs on an event, and sweeps for outcomes weekly. It is **idempotent**: if nothing is new, it changes nothing. Commit straight to the default branch.

The **operations lead** owns this playbook and answers queries about past bids from the register and the folders. There is no separate new-business agent.

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

A team bot does not run this routine without a filled bot passport ([docs/team-setup.md](../../docs/team-setup.md#team-bots)). The accounting tool is not this playbook (that is [`finance-lookup`](../finance-lookup/SKILL.md) and the other finance playbooks).

## When to use

- A scheduled daily routine should refresh the register and folders.
- The bid-running agent reports a submission or an outcome (mode `event`).
- A weekly routine sweeps submitted bids for outcomes (mode `outcome-sweep`).
- The operations lead asks about a past submitted bid (buyer, reference, what was sent, who submitted, outcome).
- Someone asks to rebuild today's register from the named source.

## When not to use

- Recording a lead the bid-running agent has not started work on (that is a pipeline concern, not this register).
- Storing a zip, a portal login, a token, or a full financial or accounts package.
- Writing the day file (that is [`daily-burndown`](../daily-burndown/SKILL.md)).

## Settings

The routine supplies the shared names in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<ops-record>`, `<timezone>`, `<destination>`, `<write-rule>`, and `<quiet-when-empty>`. `<write-rule>` for this playbook is commit to the default branch of `<ops-record>`. If a required setting is missing, ask once and stop.

These settings belong to this playbook and are filled by the passport or wrapper. They are never defaults in neat-os:

| Setting | Required | Meaning |
| --- | --- | --- |
| `<bid-source>` | yes | How this run reads bids: `pipeline-api`, `export`, `run-logs`, or `agent-report` (the bid-running agent's report of a stage change, sent files, and zip sha256). |
| `<run-mode>` | no | `daily` (default), `event`, or `outcome-sweep`. See [Modes](#modes). |
| `<pipeline-api>` | when `pipeline-api` | Base URL of the pipeline system's API. |
| `<PIPELINE_TOKEN_ENV>` | when `pipeline-api` | Environment variable that holds the API token. Never the token itself. |
| `<export-path>` | when `export` | Path of the daily export (in `<ops-record>` or a connected store). |
| `<run-log-path>` | when `run-logs` | Path of the bid-running agent's run logs. |
| `<register-path>` | no | Path of the register in `<ops-record>`. Default `pipeline/bids-register.md`. |
| `<bids-root>` | no | Folder under `<ops-record>` that holds per-bid directories. Default `bids/`. |

The source is abstract. Do not assume a product name. Use whichever of the four the passport named.

## Modes

- **`daily`** reads every bid the source reports and brings the register and folders up to date.
- **`event`** runs when the bid-running agent reports a submission or an outcome. It reads that one bid from `<bid-source>` (for `agent-report`, the report is the source) and applies the same steps to that bid only. A report from another agent starts the run. It is not approval for anything else, and its content is checked against the source like any other input.
- **`outcome-sweep`** runs weekly. For each row at Stage `submitted` with no Outcome, it asks `<bid-source>` for an outcome and updates Stage and Outcome when the source has one. Rows still waiting are listed to the operations lead in the run summary. The sweep never guesses an outcome and never changes a row the source says nothing about.

## Register

Use [templates/ops/bids-register.md](../../templates/ops/bids-register.md) (or the record's own copy). Columns, in this order: Buyer, Reference, Portal, Stage, Submitted, Notice value, Bid value, Status, Outcome.

- One row per bid. The row is the **current** version. Update Stage, Submitted, Status, Outcome, and values in place when a newer version or a stage change lands.
- **Stage** is one of `pursuing`, `submitted`, `won`, `lost`, or `withdrawn`. A bid enters at `pursuing` when the source reports that work has started on it, and at `submitted` when it is first seen after submission. A row moves forward only on a source fact. Status is the source's own wording for the current version. Outcome holds the outcome date and any short note the source gives.
- **Duplicate check before adding a row.** Compare the new bid with every row on Reference and on buyer slug (the buyer name made filesystem-safe, as in [Folder](#folder)). When the references match, update that row, even when the buyer is spelled differently. When the buyer slugs match and either row has no Reference yet, do not add a row: update the row when the source shows it is the same bid, or report it to the operations lead as a possible duplicate. Never merge or delete existing rows. A duplicate already in the register is reported, not fixed silently.
- Dates are the submitted date in `<timezone>`, as `YYYY-MM-DD`.
- Notice value and bid value stay in this private register. Do not copy them into a shared day file or digest ([agent-work-logging.md](../../conventions/agent-work-logging.md)).

## Folder

Each **successfully submitted** bid gets a folder:

```
bids/<yyyy-mm-dd>-<buyer-slug>-<ref>/
```

`<yyyy-mm-dd>` is the submitted date in `<timezone>`. `<buyer-slug>` is the buyer name in lowercase, with spaces and punctuation turned into single hyphens, and leading or trailing hyphens stripped. `<ref>` is the reference made filesystem-safe the same way (keep letters, digits, and hyphens).

The folder holds:

- The **individual files actually sent** to the buyer. Not the zip.
- `submission.md`, from [templates/ops/bid-submission.md](../../templates/ops/bid-submission.md): date, portal, reference, version, zip sha256, who submitted (a role), and Status (`current` or `superseded`).

The zip itself is not committed. Record its sha256 in `submission.md` so a later run can tell a resubmission from a repeat.

A **resubmission** is a new version. Write a new folder. If the date-buyer-ref path already exists, append `-v<n>` starting at `v2`. Set the new `submission.md` Status to `current` and the earlier folder's `submission.md` Status to `superseded`. Do not delete the earlier folder.

## Git LFS

Large binaries in the private operations record **may** use git LFS. That is optional. When the record already has LFS, add patterns to its `.gitattributes` (for example `bids/**/*.pdf`). neat-os does not require LFS and does not ship a filled `.gitattributes`.

## Hard rules

- **Pursuing or later.** A bid that is still a draft, a watch, or a lead the bid-running agent has not started work on is omitted. A `pursuing` row has no folder.
- **Never commit credentials, portal logins, or tokens** ([never-store-secrets.md](../../conventions/never-store-secrets.md)).
- **Never commit a full financial or accounts package.** Only the redacted documents that were actually sent.
- **Never commit the zip.** Individual sent files only.
- **Idempotent.** Re-running with the same source changes nothing, in every mode. Skip a bid when its row already has the same Stage and values, its folder already exists, and `submission.md` has the same version and zip sha256.
- **Default branch.** Commit the register and folders to the default branch of `<ops-record>`. Never rewrite history. If the working tree is unchanged, do not commit.
- Do not invent a row, a stage, a file, a sha256, or an outcome ([never-invent-facts](../../principles/never-invent-facts.md)).
- There is no separate new-business agent. Queries come to the operations lead, who answers from this register and the folders.

## Queries

When the operations lead asks about a past bid:

1. Find the register row by buyer or reference.
2. Open the current folder (Status `current`). Mention superseded folders when they exist.
3. Answer from `submission.md` and the sent file list. Do not invent missing fields. Do not paste credentials or pack contents that are not in the folder.

## Steps

1. Confirm the settings and `<run-mode>`. If a required setting is missing, ask once and stop. If a team bot is running this, confirm a filled bot passport exists and stop if it does not.
2. Confirm `<ops-record>`. Stop if it is missing.
3. Read bids from `<bid-source>`: every reported bid in `daily`, the reported bid in `event`, and outcomes for rows at Stage `submitted` with no Outcome in `outcome-sweep`.
   - `pipeline-api`: `<pipeline-api>` with the token in `<PIPELINE_TOKEN_ENV>`.
   - `export`: `<export-path>`.
   - `run-logs`: `<run-log-path>`.
   - `agent-report`: the bid-running agent's report, or a request to that agent for the period.
   If the named source is missing, say so and stop. Do not fall through to another source.
4. Open `<register-path>` (create it from the template when it does not exist). When an existing register has no Stage column, add it after Portal and leave the cell empty for rows the source does not cover.
5. For each bid at Stage `pursuing`, run the [duplicate check](#register), then upsert the row. Write no folder.
6. For each successfully submitted bid:
   1. Build the folder name `bids/<yyyy-mm-dd>-<buyer-slug>-<ref>/`.
   2. If a folder for this reference already has this version and the same zip sha256, skip (idempotent).
   3. If a current folder exists for this reference with a different zip sha256 or a newer submitted date, treat this as a resubmission: write the new folder (append `-v<n>` when the path would collide), mark the earlier `submission.md` superseded, and update the register row.
   4. Otherwise create the folder. Copy only the individual redacted files that were sent. Write `submission.md`. Run the [duplicate check](#register), then upsert the register row with Stage `submitted`.
7. For each outcome the source reports, set Stage to `won`, `lost`, or `withdrawn` and fill Outcome. Change nothing else on the row.
8. Leave a register cell empty when the source has no value. Do not guess. Do not delete a row because today's payload omitted it.
9. If nothing changed, follow `<quiet-when-empty>` and do not commit. Otherwise commit the register and folders to the default branch per `<write-rule>`. Never rewrite history.
10. Report possible duplicates and, in `outcome-sweep`, the rows still waiting for an outcome, to the operations lead.

## Stop

Complete when the register and folders match the source for the mode that ran (or when nothing was new and the run made no commit), when a query was answered from those files, or when a required setting, record, or source was missing and that was stated. Not complete if a credential, portal login, token, zip, or full financial or accounts package was committed, if a row, stage, outcome or file was invented, if a duplicate row was added or an existing row was merged or deleted, if a repeat run rewrote an unchanged bid, or if history was rewritten.
