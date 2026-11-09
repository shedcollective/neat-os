---
name: bids-register
description: >-
  Daily idempotent job: read submitted bids from a pipeline API, a daily
  export, or bid-running-agent run logs, and keep a markdown register plus a
  folder of the redacted files that were sent. Owned by the operations lead.
  Not a launch playbook.
---

# bids-register

Keep a markdown register of **submitted** bids in `<ops-record>`, and a folder of the files that were actually sent, for each successful submission. The run is daily and **idempotent**: if nothing is new, it changes nothing. Commit straight to the default branch.

The **operations lead** owns this playbook and answers queries about past bids from the register and the folders. There is no separate new-business agent.

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

A team bot does not run this routine without a filled bot passport ([docs/team-setup.md](../../docs/team-setup.md#team-bots)). The accounting tool is not this playbook (that is [`finance-lookup`](../finance-lookup/SKILL.md) and the other finance playbooks).

## When to use

- A scheduled daily routine should refresh the submitted-bid register and folders.
- The operations lead asks about a past submitted bid (buyer, reference, what was sent, who submitted, outcome).
- Someone asks to rebuild today's register from the named source.

## When not to use

- Recording a lead that has not been submitted (that is a pipeline concern, not this register).
- Storing a zip, a portal login, a token, or a full financial or accounts package.
- Writing the day file (that is [`daily-burndown`](../daily-burndown/SKILL.md)).

## Settings

The routine supplies the shared names in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<ops-record>`, `<timezone>`, `<destination>`, `<write-rule>`, and `<quiet-when-empty>`. `<write-rule>` for this playbook is commit to the default branch of `<ops-record>`. If a required setting is missing, ask once and stop.

These settings belong to this playbook and are filled by the passport or wrapper. They are never defaults in neat-os:

| Setting | Required | Meaning |
| --- | --- | --- |
| `<bid-source>` | yes | How this run reads submitted bids: `pipeline-api`, `export`, or `run-logs`. |
| `<pipeline-api>` | when `pipeline-api` | Base URL of the pipeline system's API. |
| `<PIPELINE_TOKEN_ENV>` | when `pipeline-api` | Environment variable that holds the API token. Never the token itself. |
| `<export-path>` | when `export` | Path of the daily export (in `<ops-record>` or a connected store). |
| `<run-log-path>` | when `run-logs` | Path of the bid-running agent's run logs. |
| `<register-path>` | no | Path of the register in `<ops-record>`. Default `pipeline/bids-register.md`. |
| `<bids-root>` | no | Folder under `<ops-record>` that holds per-bid directories. Default `bids/`. |

The source is abstract. Do not assume a product name. Use whichever of the three the passport named.

## Register

Use [templates/ops/bids-register.md](../../templates/ops/bids-register.md) (or the record's own copy). Columns, in this order: Buyer, Reference, Portal, Submitted, Notice value, Bid value, Status, Outcome.

- One row per submitted bid. Match an existing row on **Reference**. The row is the **current** version. Update Submitted, Status, Outcome, and values in place when a newer version lands.
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

- **Submitted only.** A bid that is still a draft, a watch, or a lead is omitted.
- **Never commit credentials, portal logins, or tokens** ([never-store-secrets.md](../../conventions/never-store-secrets.md)).
- **Never commit a full financial or accounts package.** Only the redacted documents that were actually sent.
- **Never commit the zip.** Individual sent files only.
- **Idempotent.** Re-running with the same source changes nothing. Skip a bid when its folder already exists and `submission.md` has the same version and zip sha256.
- **Default branch.** Commit the register and folders to the default branch of `<ops-record>`. Never rewrite history. If the working tree is unchanged, do not commit.
- Do not invent a row, a file, a sha256, or an outcome ([never-invent-facts](../../principles/never-invent-facts.md)).
- There is no separate new-business agent. Queries come to the operations lead, who answers from this register and the folders.

## Queries

When the operations lead asks about a past bid:

1. Find the register row by buyer or reference.
2. Open the current folder (Status `current`). Mention superseded folders when they exist.
3. Answer from `submission.md` and the sent file list. Do not invent missing fields. Do not paste credentials or pack contents that are not in the folder.

## Steps

1. Confirm the settings. If a required setting is missing, ask once and stop. If a team bot is running this, confirm a filled bot passport exists and stop if it does not.
2. Confirm `<ops-record>`. Stop if it is missing.
3. Read submitted bids from `<bid-source>`:
   - `pipeline-api`: `<pipeline-api>` with the token in `<PIPELINE_TOKEN_ENV>`.
   - `export`: `<export-path>`.
   - `run-logs`: `<run-log-path>`.
   If the named source is missing, say so and stop. Do not fall through to another source.
4. Open `<register-path>` (create it from the template when it does not exist).
5. For each successfully submitted bid:
   1. Build the folder name `bids/<yyyy-mm-dd>-<buyer-slug>-<ref>/`.
   2. If a folder for this reference already has this version and the same zip sha256, skip (idempotent).
   3. If a current folder exists for this reference with a different zip sha256 or a newer submitted date, treat this as a resubmission: write the new folder (append `-v<n>` when the path would collide), mark the earlier `submission.md` superseded, and update the register row.
   4. Otherwise create the folder. Copy only the individual redacted files that were sent. Write `submission.md`. Upsert the register row keyed on Reference.
6. Leave a register cell empty when the source has no value. Do not guess. Do not delete a row because today's payload omitted it.
7. If nothing changed, follow `<quiet-when-empty>` and do not commit. Otherwise commit the register and folders to the default branch per `<write-rule>`. Never rewrite history.

## Stop

Complete when the register and folders match the source (or when nothing was new and the run made no commit), when a query was answered from those files, or when a required setting, record, or source was missing and that was stated. Not complete if a credential, portal login, token, zip, or full financial or accounts package was committed, if a row or file was invented, if a repeat run rewrote an unchanged bid, or if history was rewritten.
