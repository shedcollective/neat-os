# Agent work logging

**Locked:** when an agent writes a shared work digest or an operations note, it logs work facts only.

This convention applies to shared records and digests an agent keeps for a team. It does not replace [never-store-secrets.md](never-store-secrets.md) or [neutral-reference.md](neutral-reference.md). Those still bind this repository. A private operations repository that consumes neat-os follows this page for what may be written into its shared files.

## Include

- Work discussed in public or agreed team channels.
- Slack Connect and other external client channels when the team uses them for delivery with a client. Summarise the work point. Do not paste the thread.
- Meetings, tickets, and merges about delivery.
- Direct messages only when the content is clearly work (for example a client discussing a deliverable in a direct message). Summarise the work point. Do not paste the thread.

## Exclude

- Personal chatter, health, family, home, and personal finance.
- Secrets, tokens, passwords, and private URLs.
- Billing amounts, rates, totals, and VAT figures in any shared file that staff who are not directors can read.
- Another client's confidential detail in a note or ticket that client can read.
- Names of bots in the shared record.
- Invented leave, absence, or holiday facts. Verify against the holiday calendar or an explicit message before writing People lines.

## Placement

Coding standards and company playbooks stay in neat-os. Living agency operational state (day files, in-flight boards, client folders) stays in a private operations repository. This public tree holds the rules and the playbooks only.

Day files put **Agency state first**, then group work **by project** in one shared body by default (optional CRM `Client:` links in private records). Cross-cutting delivery sits under Agency. That by-project layout is the default, not a ban on other top-level sections. A bot passport may name its own top-level sections, for example by discipline. When it does, those headings replace the project block. Agency state stays first. Sources unavailable stays last. Perspective add-ons append into the sections the passport named, or into the default project sections when it did not. See [templates/ops/burndown-day.md](../templates/ops/burndown-day.md), [templates/agent/passport.md](../templates/agent/passport.md), and [docs/agency-ops.md](../docs/agency-ops.md).
