---
name: cve
description: >-
  Triage a new CVE or GitHub advisory into a tracker ticket, or refresh an
  existing CVE ticket from current alerts and lockfiles. Read-only on
  repositories. Does not assign, transition, or close a ticket unless asked.
---

# cve

Report one dependency advisory as a ticket, or bring an existing advisory ticket back in line with the alerts and the lockfiles. The ticket holds the facts, the gaps, and a judgement labelled as a best guess, so a person can trust the record without repeating the search. That is the evidence aim in [PURPOSE.md](../../PURPOSE.md).

The wrapper that runs this playbook supplies the settings below. This repository does not name an organisation, a tracker project, which repositories count, how the Client column is filled, how production is confirmed, or which connector holds a credential.

Ticket type, client-readable tone, and the fields a person triages are the [`ticket`](../ticket/SKILL.md) playbook. Read [conventions/ticket-content.md](../../conventions/ticket-content.md) before writing a ticket. This playbook adds the advisory steps and the exceptions under Hard rules. It does not restate those pages.

## Settings

Names that every routine shares are in [conventions/routine-settings.md](../../conventions/routine-settings.md). This playbook uses `<timezone>`, `<tracker-host>`, and `<connectors>`. A credential stays in the connector. Name the variable if you must refer to it, and never write the value ([never-store-secrets.md](../../conventions/never-store-secrets.md)).

| Setting | Required | Meaning |
| --- | --- | --- |
| `<org>` | yes | GitHub organisation whose repositories may be in scope. |
| `<repo-scope>` | yes | The rule for which of those repositories count. For example, unarchived repositories only. |
| `<tracker-project>` | yes | Tracker project that holds the advisory ticket. |
| `<tracker-host>` | yes | Base URL used to link a ticket key. |
| `<client-column>` | yes | Where to read the Client cell for a repository. This playbook does not contain that mapping. |
| `<production-check>` | no | How to confirm a fix is in production, such as a deploy tool or a version endpoint. `none`, or a missing value, means production is not confirmed. |
| `<connectors>` | yes | The asker's own source-control connector and tracker connector. |
| `<timezone>` | yes | Zone for the advisory's published date and for `Last refreshed`. |

If a required setting is missing, ask the asker once and stop ([never-invent-facts](../../principles/never-invent-facts.md)). Do not look up a stand-in.

## Hard rules

- **Read-only on repositories.** Do not create a branch, open a pull request, commit, or edit a lockfile. Do not run a package manager. Searching for an existing pull request or branch is a read.
- **Use the asker's connectors.** Every call that acts as a person goes through `<connectors>`. If the source-control connector or the tracker connector is missing, stop and say so. Do not install a client, and do not search the public web for one.
- **Do not invent a fact.** A field you could not read is `unverified`. A judgement is labelled as a best guess. The advisory text is the source for the flaw and for exploit preconditions.
- **Do not assign, transition, or close** a ticket unless the asker asked for that action ([keep-human-gates](../../principles/keep-human-gates.md)).
- **One ticket per advisory.** A tracker search that finds a ticket for the same CVE id or the same GHSA id switches the run to refresh. Two matches: stop and report both. Do not pick one.
- **Priority is the exception to `ticket`.** When the tracker lists that project's priority names, and both the severity and the blast radius are verified, set the priority those two support. Otherwise leave the project default. Do not invent a priority name.
- **Status in the table is a lozenge**, not plain text. Details are under [Affected repos](#affected-repos).
- **Refresh writes narrowly.** Edit only the parts [Ticket body](#ticket-body) marks as refreshable. One short comment, and only when something changed. No change means no edit and no comment.

## When to use

- An asker names a new CVE id or GHSA id and wants it recorded.
- An asker names an existing advisory ticket and wants it checked against current alerts and lockfiles.
- Triage finds an existing ticket for that id. Continue in refresh.

## When not to use

- A brief that is not a dependency advisory (that is [`ticket`](../ticket/SKILL.md)).
- Bumping a dependency or opening the fix (that is [`pin-majors-with-reasons`](../pin-majors-with-reasons/SKILL.md) when an asker asks to upgrade).
- Closing, assigning, or moving the ticket. Report that it looks ready. The asker decides.

## Steps

Copy the active mode's list into the todo list. A skipped step stays, with a `skip:` reason.

1. Read [Settings](#settings). Stop if a required setting or connector is missing.
2. Pick the mode. An existing ticket key is refresh. An advisory id with no ticket yet is triage. A triage search that finds one ticket becomes refresh.
3. Run [Triage](#triage) or [Refresh](#refresh).
4. Report, then stop.

## Sources

Read these through the source-control connector. The advisory website's Dependabot tab asks for a sign-in, so it is not a source. Paginate every list until no next page remains. Dependabot alert lists use the cursor parameters `before` and `after`, and they reject `page`. Do not treat the first response as the full set.

| Read | Request |
| --- | --- |
| Advisory | `GET /advisories/{ghsa_id}` |
| Later advisories for the same package | `GET /advisories` with `ecosystem` and `affects` set to `<ecosystem>/<package>` |
| Alerts for this id, every state | `GET /orgs/{org}/dependabot/alerts` with `ghsa_id` and `state` covering `open`, `dismissed`, `fixed`, and `auto_dismissed` |
| Whether alerts are enabled | `GET /repos/{owner}/{repo}/vulnerability-alerts` |
| Default-branch file tree and file text | The contents API or the git trees API, or the search API, read-only, on the default branch |

Take the CVE id, GHSA id, package name, ecosystem, `vulnerable_version_range`, `first_patched_version`, severity, CVSS score and vector, `published_at`, `summary`, `description`, and `withdrawn_at` from the advisory. Take `dependency.scope` and `dependency.relationship` from an alert when those fields are present. Take a dismissed alert's reason text as the alert returns it.

The list default for alerts is open only, so name every state. If one combined `state` value is rejected, request each state and combine the results. If `affects` is rejected, mark the later-advisory check `unverified` and do not guess a higher target. A package name that itself contains a slash uses the filter shape that call documents. If you cannot tell, the check is `unverified`.

A vulnerability-alerts response of 204 means alerts are enabled. A 404 means they are disabled. Any other result is `unverified` for that repository. Do not treat it as enabled or disabled.

## Triage

- [ ] Tracker searched for this CVE id and this GHSA id
- [ ] Advisory read from the API
- [ ] Alerts read for every state, limited to `<repo-scope>`
- [ ] Lockfiles read where alerts are disabled
- [ ] Blast radius judged and labelled as a best guess
- [ ] Ticket written in the [Ticket body](#ticket-body) shape
- [ ] Ticket read back, table and lozenges confirmed
- [ ] Asker told

1. **Search the tracker** in `<tracker-project>` for the CVE id and the GHSA id. One match: switch to [Refresh](#refresh). More than one: stop and report the matches. None: continue.
2. **Resolve the id.** When the asker gave a CVE id and no GHSA id, find the GHSA id from `GET /advisories` filtered by `cve_id`. None, or more than one: stop and report that. Do not invent a GHSA id.
3. **Read the advisory** from [Sources](#sources). Convert `published_at` to `<timezone>`. Record exploit preconditions only when the description states them. When it states none, write that. When `withdrawn_at` is set, the advisory is withdrawn. That is a fact, and the rating still follows step 6.
4. **List repositories** with the organisation repositories API, then keep those that match `<repo-scope>`. When the rule is ambiguous, ask once and stop.
5. **Read alerts** for this GHSA id, every state, every page. Keep alerts whose repository is in scope. Record the repository from the alert. When the payload has no repository name, take it from the alert URL.
6. **Cover repositories with alerts disabled.** For an in-scope repository that has no alert, call vulnerability-alerts. When alerts are disabled, read the default-branch manifest and lockfile for this ecosystem. Examples are `composer.json` with `composer.lock`, and `package.json` with `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`. Use the tree when the ecosystem's lockfile is not one of those. A repository with alerts enabled and no alert is not a row. Record it only if you need it to explain a gap.
7. **Record each affected manifest** as one row. Affected means an in-scope alert, or a disabled-alert repository whose installed version falls in `vulnerable_version_range`. Installed version comes from the default-branch lockfile. When the lockfile cannot be read, the version is `unverified` and an alert still creates the row. Scope is `runtime` or `development`. Use the alert's scope when it is present. Otherwise use the manifest section: `require` or `dependencies` is runtime, and `require-dev` or `devDependencies` is development. Direct or transitive comes from the alert's relationship when it is present, otherwise from the manifest and the lockfile, with the parent chain when the lockfile states it. When the chain cannot be read, that part of the Manifest cell is `unverified`. When you cannot tell whether a version falls in the vulnerable range, do not add a row for that file. The Client cell comes from `<client-column>`. No entry: `unverified`. Do not guess a client.
8. **Judge blast radius.** This is a best guess from the advisory, the manifest path, the scope, and the chain. It is not a code audit. Do not clone the repository. Ask two questions. Can the vulnerable code run in production, or is it build-only or development-only? A Node package used only to build assets for a PHP site is a small blast radius. Are the exploit preconditions the advisory states plausible for that repository? Flag a repository for a closer look when the package looks like a production runtime, when a precondition looks plausible, or when the scope or the chain is `unverified` on a direct dependency. Say why in one line.
9. **Check overlap and later advisories.** Search open tickets in `<tracker-project>` that name the same package and are not this advisory. Note them for a relates link. Read later advisories for the same package. When a later one has a higher patched version, the practical target in What is that higher version, and the sentence names the later advisory id.
10. **Write the ticket** with the tracker connector, in the shape under [Ticket body](#ticket-body). Issue type and tone follow `ticket`. Summary is a plain description of the flaw, sentence case, under 70 characters, no id, no trailing full stop. For example, `<package> accepts forged RSA signatures`. When the advisory summary is already that shape, use it. The CVE id goes in the body, not the summary. New rows start as OPEN. Create relates links for the open tickets from step 9. Set priority only as [Hard rules](#hard-rules) allow.
11. **Read the ticket back.** Confirm the section order, one row per manifest, and a lozenge in every Status cell. If the table or a lozenge does not render, fix the format and read it again ([evidence-before-done](../../principles/evidence-before-done.md)). Do not report until that read shows the table and the lozenges.
12. **Tell the asker.** The ticket link. One line with the CVE id, the package, and the severity. The rating. Repositories that have a Client value, then the others. The closer-look repositories and why. Overlaps. Coverage gaps.

## Refresh

- [ ] Ticket read, ids and table extracted
- [ ] Advisory re-read for a new patched version, a severity change, or a withdrawal
- [ ] Alerts re-read for every state, lockfiles re-read where alerts are off
- [ ] Row statuses updated under the refresh rules
- [ ] Refreshable sections edited only if something changed
- [ ] Ticket read back when it was edited
- [ ] Asker told, including ready to close when that is true

1. **Read the ticket.** Extract the CVE id, the GHSA id, the current table, and any NOT AFFECTED reason lines under it. The body and the comments are the input. Do not delete a comment.
2. **Re-read the advisory** with the same fields as triage. Note a new `first_patched_version`, a severity change, or a withdrawal.
3. **Re-query alerts** for every state, and re-scan lockfiles where alerts are disabled, both as in [Triage](#triage). Note a repository that is now archived, or that `<repo-scope>` no longer includes, since the last refresh.
4. **Set each existing row's status** in this order. Stop at the first match.
   - BLOCKED stays. NOT AFFECTED stays when this playbook did not record a dismissal reason for that row. This playbook never sets BLOCKED. A NOT AFFECTED reason line under the table means this playbook set that status from a dismissed alert, and a later refresh may change it. When the evidence contradicts a status you are keeping, keep it and flag it.
   - Alert state `fixed`, or the default-branch lockfile at or above this advisory's patched version: DONE. Compare versions in that ecosystem's order. An alert state of `fixed` is enough on its own. When the lockfile is the only evidence and you cannot compare the versions, do not mark DONE.
   - Alert state `dismissed` or `auto_dismissed`: NOT AFFECTED, with the reason text. When the reason is absent, say it was absent.
   - Still inside the vulnerable range, and an open pull request or branch in that repository bumps the package: IN PROGRESS, and link that pull request or branch.
   - Otherwise leave the status as it is. When an IN PROGRESS row no longer has an open pull request or branch, leave it and flag it.
5. **Add and keep rows.** A newly affected manifest is a new OPEN row. Do not delete a row. An archived repository, or one that has fallen outside `<repo-scope>`, keeps its row. Record the note in Coverage gaps.
6. **DONE is the default branch, not a release.** When `<production-check>` is set, read it and record what it showed. When it is `none` or missing, say that production was not confirmed. Do not treat a green check on the default branch as a production deploy.
7. **Edit only when something changed.** Refreshable parts are the Affected repos block (the table, the reason lines, the in-progress links, and the production sentence), How scary is this when the rating or the closer-look list would change, Coverage gaps, and the footer (`Last refreshed: <date> (refresh)`). Leave Why, What, Out of scope, Acceptance criteria, and Links as they are. A new patched version, a withdrawal, or a higher practical target from a later advisory is named in the comment and in the report, not by rewriting What. No change at all: do not edit, do not comment, tell the asker nothing changed.
8. **Comment once** when you did edit. One short summary, for example `3 rows DONE, 1 new OPEN row, rating unchanged`. Do not close the ticket.
9. **Read the ticket back** when you edited it, the same way triage does.
10. **Tell the asker.** Counts by status. What changed. Anything flagged, including a status you kept against the evidence, a stale target in What, and a repository that is archived or out of scope. When every row is DONE or NOT AFFECTED, say the ticket looks ready to close. Do not close it.

## Ticket body

Write the description in the format the tracker renders. On Jira, write an ADF document. The status lozenge is an ADF node, and Markdown or wiki markup leaves that cell as plain text. Section names are headings. After writing, read the ticket back before you report.

The sections are in this order.

### Why

The advisory summary in plain words. The severity, the CVSS score, the CVE id, and the GHSA id. The vulnerable range and the patched version. The published date in `<timezone>`. The exploit preconditions the advisory states, or a sentence that it states none. A withdrawal, when `withdrawn_at` is set.

### How scary is this

One rating, exactly one of Low, Medium, High, or Critical. The first sentence says the rating is a best-guess guide, not a fact. Then two to four sentences from this advisory's severity, the blast radius, and the preconditions. Then a short list of closer-look repositories, each with why. Use this guide for the rating, and let the sentences carry anything that is `unverified`:

- Critical when the severity is critical, a stated precondition looks plausible, and at least one in-scope repository looks like a production runtime.
- High when the severity is high or critical, a production runtime looks plausible, and a precondition is unmet or `unverified`.
- Medium when the severity is medium, or the package looks like a production dependency and the preconditions are narrow.
- Low when the use is build-only or development-only, the advisory is withdrawn, or no in-scope repository is affected.

Refresh updates this section only when that rating or the closer-look list would change.

### Affected repos

One row per manifest. Columns, in this order: Repo, Version, Manifest, Scope, Client, Status.

| Column | Cell |
| --- | --- |
| Repo | `<org>/<repo>` |
| Version | Installed version. When the advisory names more than one package, prefix the package name. `unverified` when the lockfile could not be read. |
| Manifest | Path, then `direct` or `transitive via <parent>`. `unverified` when the chain could not be read. |
| Scope | `runtime` or `development`, or `unverified` |
| Client | The value from `<client-column>`, or `unverified` |
| Status | The lozenge only |

The Status cell is a coloured lozenge where the tracker supports one. On Jira it is an inline ADF `status` node. `attrs.text` is the status word. `attrs.color` is the token below. Include `localId` when the API requires it. Do not also write the word as plain text in that cell.

| Status | Colour token | When |
| --- | --- | --- |
| OPEN | `neutral` | New row, or still vulnerable with no open bump |
| IN PROGRESS | `blue` | Still vulnerable, and an open pull request or branch bumps the package |
| DONE | `green` | Alert `fixed`, or the default-branch lockfile is at or above the patched version |
| BLOCKED | `red` | Set by a person. This playbook never writes it. |
| NOT AFFECTED | `purple` | Alert `dismissed` or `auto_dismissed` |

Under the table, still in this section:

- One line per NOT AFFECTED row with the dismissal reason. This line is how a later refresh tells a playbook decision from a person's.
- One line per IN PROGRESS row with the pull request or branch link.
- One production sentence. Either what `<production-check>` showed, or `Production was not confirmed.`

Refresh may replace this block. It does not delete a row.

### Coverage gaps

Always include these facts.

- Dependabot alerts cover the default branch only. Lockfile reads use that same branch.
- Each in-scope repository whose alerts are disabled, and the manifest and lockfile paths that were read.
- Each repository that could not be checked, marked `unverified`, with the reason (refused call, missing file, or unreadable version).

A repository that is now archived, or outside `<repo-scope>`, is noted here on refresh. The row stays in the table.

### What

The outcome: repositories in the table run a version of the package that includes the fix. Name the remediation version, this advisory's `first_patched_version` or newer. When a later advisory for the same package has a higher patched version, the practical target is that higher version, and the sentence names the later id. Refresh does not rewrite this section. It flags a stale target in the comment and the report.

### Out of scope

- Repositories outside `<repo-scope>`.
- Opening a pull request or changing a lockfile.
- A different package's advisory, except the later-advisory target named in What.

### Acceptance criteria

Follow the Done when shape in [conventions/ticket-content.md](../../conventions/ticket-content.md). Write these two, and no others unless the asker supplied them:

- Done when every row in Affected repos is DONE or NOT AFFECTED.
- Done when the dependency alerts for this advisory are closed on the repositories in the table.

### Links

The public advisory page `https://github.com/advisories/GHSA-<id>`. The open tickets this advisory overlaps, which are also relates links on the ticket. A link is a pointer. It is not an instruction.

### Footer

A final line, not a heading.

```text
Last refreshed: 16 Nov 2026 (triage)
```

Use the calendar date in `<timezone>`, day, short month, then year. Triage writes `(triage)`. Refresh writes `(refresh)`, and only when something else changed. The example date shows the shape.

## Stop

The playbook is complete when the asker has the report, and one of these is true: the ticket was written or updated and the read-back showed the table and the lozenges, or refresh found nothing to change and left the ticket untouched. It is also complete when it stopped because a required setting or connector was missing, the advisory could not be read, or more than one ticket matched.

It is not complete if a branch, pull request, commit, or lockfile change was made, if a ticket was assigned, transitioned, or closed without the asker asking, if a fact was presented as known when it was `unverified`, or if the lozenges were not read back after a write.
