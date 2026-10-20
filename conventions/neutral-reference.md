# Neutral reference

**Locked:** this repository names roles, not people. It does not name clients, projects, products, or bots.

A reader who has only this repository should not learn who works on it or which clients it has served. Those facts belong in the consuming repository, or in the agent's own configuration. This is a convention, not a principle. The principle set has no numeric cap ([ADR-0018](../docs/decisions/0018-no-numeric-principle-cap.md)). Keep the set small. Delete a principle that stops changing behaviour.

## Roles

Name the role. The roles in this repository are maintainer, PR author, reviewer, code agent, assurance agent, design agent, and UX agent.

## Placeholders

Do not write a client name, a product name, a project name, or a bot name. Do not write a real ticket key, a Jira or Slack identifier, or a run id. Use a placeholder.

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

Commit messages and pull request bodies follow this page. Do not add a `Co-authored-by` trailer unless that person wrote the change. Do not add a `Signed-off-by` trailer.

Do not address the reader as the person to ask, tell, or ping (`ask me`, `tell me`, `ping me`). Do not claim a pull request, a repository, or an agent with `my` (`my PR`, `my repo`, `my agent`).

## What the check enforces

`scripts/check-neutral.js` scans the tree. It flags a mailbox whose domain is not `example.*`, a Slack id, an Atlassian cloud host, a login mention other than `@scope/pkg`, the publisher scope `@shedcollective`, or `@<login>`, a co-author trailer, a ticket key whose prefix is not `GH`, `ADR`, `ACME`, or `TICKET`, and the phrases in the previous section. A CSS at-rule (`@media`, `@keyframes`) is not a login. A ticket key is a letter prefix and a number of at least two digits. A URL userinfo at `github.com` is the git transport, same as `git@github.com`. `scripts/check` runs this script.

On a pull request, the check also reads the pull request body and the commit messages in the pull request range. The platform wraps the body in `<!-- CURSOR_AGENT_PR_BODY_BEGIN -->` and `<!-- CURSOR_AGENT_PR_BODY_END -->` and appends a footer after the end marker. The check reads only the text between the markers. The markers and the footer are platform boilerplate. A body without the markers is checked in full. The pull request body is not exempt. This page is the only file that may name the rejected phrases.

This page names the patterns the check rejects. Every other file is scanned in full, including code. The check script is not scanned. It holds the patterns.

## Source

[ADR-0016](../docs/decisions/0016-neutral-reference.md).
