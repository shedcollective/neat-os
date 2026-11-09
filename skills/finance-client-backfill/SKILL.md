---
name: finance-client-backfill
description: >-
  Create missing client records in the director's accounting tool from the
  private operations record. Tool name, token, and account come from the
  passport. Not a launch playbook.
---

# finance-client-backfill

Create client records that exist in `<ops-record>` but not yet in the accounting tool. Usable by any director. The tool's name, token, and account stay in the passport or wrapper.

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

A team bot does not run this routine without a filled bot passport ([docs/team-setup.md](../../docs/team-setup.md#team-bots)). Weekly catch-up is [`finance-client-sync`](../finance-client-sync/SKILL.md). A lookup is [`finance-lookup`](../finance-lookup/SKILL.md).

## When to use

- A director is connecting an accounting tool and needs existing clients created there.
- Someone asks to backfill missing contacts from the operations record into that tool.

## When not to use

- A weekly sync of records that already exist in both places (that is [`finance-client-sync`](../finance-client-sync/SKILL.md)).
- Looking up an invoice or balance (that is [`finance-lookup`](../finance-lookup/SKILL.md)).
- Writing amounts into a shared day file or client brief.

## Settings

The routine supplies the shared names in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<ops-record>`, `<timezone>`, `<destination>`, and `<write-rule>`. If a required setting is missing, ask once and stop.

These settings belong to this playbook and are filled by the passport or wrapper. They are never defaults in neat-os:

| Setting | Required | Meaning |
| --- | --- | --- |
| `<accounting-tool>` | yes | Name of the accounting product this director uses. |
| `<ACCOUNTING_TOKEN_ENV>` | yes | Environment variable that holds the token. Never the token itself. |
| `<accounting-account>` | yes | Which company or account in that tool this director uses. |
| `<client-fields>` | no | Fields this run may write into the tool (for example name, billing address). Default: name and billing email only. |

## Hard rules

- **Director only.** Deliver to that director's `<destination>`. Do not use another director's token or account.
- **No secrets** in the passport, the wrapper, or the report ([never-store-secrets.md](../../conventions/never-store-secrets.md)).
- **Do not invent a client.** Create a record only when the operations record already has that client ([never-invent-facts](../../principles/never-invent-facts.md)).
- **Do not write amounts, rates, or invoice line items** into `<ops-record>` from this run.
- Create only. Do not update a record that already exists in the tool (that is [`finance-client-sync`](../finance-client-sync/SKILL.md)).
- Writes into `clients/` follow `<write-rule>`.

## Steps

1. Confirm the settings. If a required setting is missing, ask once and stop. Confirm a filled bot passport exists for a team bot.
2. Confirm `<ops-record>` and list client folders (or the record's client register). Stop if none exist.
3. Authenticate to `<accounting-tool>` as `<accounting-account>` using `<ACCOUNTING_TOKEN_ENV>`. If the tool, account, or token is missing, say so and stop.
4. For each client in the operations record, look up a matching contact in the tool (name or billing email). Skip when a match exists.
5. Create the missing contact with only the fields in `<client-fields>`. Do not copy credentials, personal notes, or billing amounts.
6. Report to `<destination>`: created, already present, skipped because a required field was missing. Link nothing that contains a token.

## Stop

Complete when every operations-record client has been created in the tool or reported as already present or skipped, or when a required setting was missing and that was stated. Not complete if a token was written down, a client was invented, or another director's account was used.
