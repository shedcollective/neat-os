# Neutral reference

**Locked:** this public repository keeps out client names, client projects, and internal chat. It may name a person, an author, or a team member's GitHub login.

The rule exists so a reader who has only this repository does not learn which clients it has served, and does not read a Slack thread or other internal chatter. Those facts belong in the consuming repository, or in a private record. A personal name, an authorship line, and a team member's GitHub login are allowed. This is a convention, not a principle. The principle set has no numeric cap ([ADR-0018](../docs/decisions/0018-no-numeric-principle-cap.md)). Keep the set small. Delete a principle that stops changing behaviour.

Who a commit names is [attribution.md](attribution.md).

## Roles

Name the role when the sentence is about the role. The roles in this repository are maintainer, PR author, reviewer, director, asker, operations lead, lock owner, client lead, code agent, assurance agent, design agent, and UX agent.

A person's name is allowed when the sentence is about that person.

## Placeholders

Do not write a client name or a client project name. Do not write a real ticket key, a Jira or Slack identifier, or a run id. Use a placeholder.

| Kind | Placeholder |
| --- | --- |
| Ticket key | `ACME-123` |
| Project | `<project>` |
| Client | `<client>` |
| Domain or mailbox | an `example.*` domain, such as `example.com` |
| Login | `@<login>` |

Examples are synthetic. Do not paste a real client, a real thread, or a real run.

## Where a project fact lives

A fact about one product repository lives in that repository's `.agents/project.md`, or in the agent's own configuration. The fact might be the client, the stack, the ticket prefix, or a vendor. When that slot is empty, a playbook falls back to generic behaviour. It does not invent the fact ([never-invent-facts](../principles/never-invent-facts.md)).

## Allowed self-references

This repository may cite its own issue and pull request numbers, `GH-<n>` and `#<n>`. It may cite an architecture decision id, `ADR-<n>`, and the placeholders `ACME-<n>` and `TICKET`.

The publisher scope in package metadata and install lines is `@shedcollective/neat-os`. The organisation scope is `@shedcollective`. Before 0.4.0 the package name was `@shedcollective/shed-os`.

The git SSH form `git@github.com` in an install line is the transport. The check treats it as transport, and it treats any other mailbox as a name.

## Commits and pull requests

Commit messages and pull request bodies follow this page for client names and internal chat. Authorship and trailers are [attribution.md](attribution.md).

Do not address the reader as the person to ask, tell, or ping (`ask me`, `tell me`, `ping me`). Do not claim a pull request, a repository, or an agent with `my` (`my PR`, `my repo`, `my agent`).

## What the check enforces

`scripts/check-neutral.js` scans the tree. It flags a mailbox whose domain is not `example.*`, a Slack id, an Atlassian cloud host, a login mention other than `@scope/pkg`, the publisher scope `@shedcollective`, or `@<login>`, a co-author trailer, a ticket key whose prefix is not `GH`, `ADR`, `ACME`, or `TICKET`, and the phrases in the previous section. A CSS at-rule (`@media`, `@keyframes`) is not a login. A ticket key is a letter prefix and a number of at least two digits. A URL userinfo at `github.com` is the git transport, same as `git@github.com`. `scripts/check` runs this script.

On a pull request, the check also reads the pull request body and the commits in the pull request range. It does not read commits outside that range. History already on `develop` is left as it is.

For each commit in the range it reads the message, the author email, and the committer email. The message check is the same scan as the tree. The identity rules are in [attribution.md](attribution.md). A co-author trailer fails. A blocked author or committer address fails. A GitHub noreply author address fails unless it is on the allowlist in `scripts/check-neutral.js`. The committer may be the address GitHub uses when it merges on the web.

The platform wraps the body in `<!-- CURSOR_AGENT_PR_BODY_BEGIN -->` and `<!-- CURSOR_AGENT_PR_BODY_END -->` and appends a footer after the end marker. The check reads only the text between the markers. The markers and the footer are platform boilerplate. A body without the markers is checked in full. The pull request body is not exempt. This page and [attribution.md](attribution.md) are the only files that may name the rejected phrases.

This page names the patterns the check rejects, apart from the addresses, which live in the check script so the tree scan does not treat them as mailboxes. Every other file is scanned in full, including code. The check script is not scanned. It holds the patterns and the allowlist.

## Source

[ADR-0016](../docs/decisions/0016-neutral-reference.md), narrowed by [ADR-0023](../docs/decisions/0023-commit-attribution.md).
