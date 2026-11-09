---
name: finance-client-sync
description: >-
  Weekly sync of client records between the private operations record and the
  director's accounting tool. Tool name, token, and account come from the
  passport. Not a launch playbook.
---

# finance-client-sync

Keep client records in `<ops-record>` and the accounting tool aligned. Usable by any director. The tool's name, token, and account stay in the passport or wrapper.

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

A team bot does not run this routine without a filled bot passport ([docs/team-setup.md](../../docs/team-setup.md#team-bots)). A first-time create-missing run is [`finance-client-backfill`](../finance-client-backfill/SKILL.md). A lookup is [`finance-lookup`](../finance-lookup/SKILL.md).

## When to use

- A scheduled weekly routine should sync client records both ways, or in the direction the passport names.
- A director asks to catch up names, billing emails, or addresses after a week of changes.

## When not to use

- Creating a batch of missing contacts for the first time (that is [`finance-client-backfill`](../finance-client-backfill/SKILL.md)).
- Looking up one invoice or balance (that is [`finance-lookup`](../finance-lookup/SKILL.md)).
- Writing amounts into a shared day file or client brief.

## Settings

The routine supplies the shared names in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<ops-record>`, `<timezone>`, `<destination>`, `<write-rule>`, and `<quiet-when-empty>`. If a required setting is missing, ask once and stop.

These settings belong to this playbook and are filled by the passport or wrapper. They are never defaults in neat-os:

| Setting | Required | Meaning |
| --- | --- | --- |
| `<accounting-tool>` | yes | Name of the accounting product this director uses. |
| `<ACCOUNTING_TOKEN_ENV>` | yes | Environment variable that holds the token. Never the token itself. |
| `<accounting-account>` | yes | Which company or account in that tool this director uses. |
| `<sync-direction>` | no | `ops-to-tool`, `tool-to-ops`, or `both`. Default `both`. |
| `<client-fields>` | no | Fields this run may copy. Default: name and billing email only. |

Writes into `clients/` follow `<write-rule>` (normally a pull request, a director merges). Writes into the accounting tool happen only for fields in `<client-fields>` and only when `<sync-direction>` allows them.

## Hard rules

- **Director only.** Deliver to that director's `<destination>`. Do not use another director's token or account.
- **No secrets** in the passport, the wrapper, the operations record, or the report ([never-store-secrets.md](../../conventions/never-store-secrets.md)).
- **Do not invent a client** ([never-invent-facts](../../principles/never-invent-facts.md)).
- **Do not copy amounts, rates, or invoice line items** into a shared file.
- Do not delete a client in either system. Report a mismatch instead.

## Steps

1. Confirm the settings. If a required setting is missing, ask once and stop. Confirm a filled bot passport exists for a team bot.
2. Confirm `<ops-record>`. Authenticate to `<accounting-tool>` as `<accounting-account>` using `<ACCOUNTING_TOKEN_ENV>`. Stop if either side is missing.
3. List clients in the operations record and contacts updated since the last successful run (or the last seven days in `<timezone>` when no last-run stamp exists).
4. Match on name or billing email. For each match, copy only `<client-fields>` in `<sync-direction>`. For a client that exists on one side only, report it; create it only when `<sync-direction>` includes that side and the passport's Never list allows creates. Otherwise leave it for [`finance-client-backfill`](../finance-client-backfill/SKILL.md).
5. Commit operations-record edits per `<write-rule>`. Never rewrite history.
6. Report to `<destination>`: updated, reported as one-sided, skipped. If nothing changed, follow `<quiet-when-empty>`.

## Stop

Complete when the week's mismatches are applied or reported, or when a required setting was missing and that was stated. Not complete if a token was written down, a client was invented or deleted, amounts were copied into a shared file, or another director's account was used.
