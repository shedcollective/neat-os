---
name: finance-lookup
description: >-
  Look up a client, invoice, or balance in the director's accounting tool.
  Tool name, token, and account come from the passport. Not a launch playbook.
---

# finance-lookup

Answer a director's question from the accounting tool: a client, an invoice, or a balance. Usable by any director. The tool's name, token, and account stay in the passport or wrapper.

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

A team bot does not run this routine without a filled bot passport ([docs/team-setup.md](../../docs/team-setup.md#team-bots)). Creating missing contacts is [`finance-client-backfill`](../finance-client-backfill/SKILL.md). A weekly sync is [`finance-client-sync`](../finance-client-sync/SKILL.md).

## When to use

- A director asks for a client's outstanding balance, last invoice, or contact record in the accounting tool.
- A routine needs a single verified figure before a director conversation.

## When not to use

- Creating or updating client records (that is [`finance-client-backfill`](../finance-client-backfill/SKILL.md) or [`finance-client-sync`](../finance-client-sync/SKILL.md)).
- Writing amounts into a shared day file, digest, or client brief ([`client-brief`](../client-brief/SKILL.md) stays amount-free).
- Filing a ticket (that is [`ticket`](../ticket/SKILL.md)).

## Settings

The routine supplies the shared names in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<ops-record>` (optional), `<timezone>`, and `<destination>`. If a required setting is missing, ask once and stop.

These settings belong to this playbook and are filled by the passport or wrapper. They are never defaults in neat-os:

| Setting | Required | Meaning |
| --- | --- | --- |
| `<accounting-tool>` | yes | Name of the accounting product this director uses. |
| `<ACCOUNTING_TOKEN_ENV>` | yes | Environment variable that holds the token. Never the token itself. |
| `<accounting-account>` | yes | Which company or account in that tool this director uses. |

The asker names the client, invoice, or account id for this run.

## Hard rules

- **Director only.** Deliver to that director's `<destination>`. Do not use another director's token or account.
- **No secrets** in the report ([never-store-secrets.md](../../conventions/never-store-secrets.md)).
- **Do not invent a figure** ([never-invent-facts](../../principles/never-invent-facts.md)). If the tool has no match, say so.
- Amounts may appear in this director-only reply. They must not be copied into a shared day file, digest, or client brief ([agent-work-logging.md](../../conventions/agent-work-logging.md)).
- Read only. Do not create, edit, or send invoices.

## Steps

1. Confirm the settings and the named client, invoice, or account id. If a required setting or the subject is missing, ask once and stop.
2. Authenticate to `<accounting-tool>` as `<accounting-account>` using `<ACCOUNTING_TOKEN_ENV>`. Stop if the tool, account, or token is missing.
3. Look up the subject. Prefer an exact invoice number or account id, then a unique client name. If more than one match, list the matches and stop for the director to pick.
4. Reply to `<destination>` with only what was asked: identity, status, outstanding balance, last invoice date, or the named invoice's status. One line per fact. No token, no full line-item dump unless the director asked for that invoice.
5. Do not write the amounts into `<ops-record>`.

## Stop

Complete when the director has the answer, or when the tool had no unique match and that was stated. Not complete if a token was written down, a figure was invented, amounts were copied into a shared file, or another director's account was used.
