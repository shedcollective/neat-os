# Neutral reference

**Locked:** Shed's business stays out of this public repository. That means client names, client companies, client projects, Slack links and quotes, and internal discussion.

The rule covers everything this repository publishes: files and their paths, commit messages, pull requests, issues, and comments. A reader who has only this repository should not learn which clients Shed works for, what their projects are, or what was said in Slack or another internal channel. Those facts belong in the product repository, or in a private record. This is a convention, not a principle. The principle set has no numeric cap ([ADR-0018](../docs/decisions/0018-no-numeric-principle-cap.md)). Keep the set small. Delete a principle that stops changing behaviour.

The rule is not about people. A person's name, a commit author, and a GitHub login may appear. Who is credited for a commit is [attribution.md](attribution.md).

## Placeholders

Do not write a client name, a client company, or a client project. Do not write a real ticket key, a Jira or Slack identifier, a Slack link, or a run id. Use a placeholder.

| Kind | Placeholder |
| --- | --- |
| Ticket key | `ACME-123` |
| Project | `<project>` |
| Client or client company | `<client>` |
| Domain or mailbox | an `example.*` domain, such as `example.com` |

Examples are synthetic. Do not paste a real client, a real thread, or a real run. Do not link or quote a Slack thread or another internal discussion. State the decision, and link the GitHub issue when the history matters ([writing.md](writing.md)).

## Where a project fact lives

A fact about one product repository lives in that repository's `.agents/project.md`, or in the agent's own configuration. The fact might be the client, the stack, the ticket prefix, or a vendor. When that slot is empty, a playbook falls back to generic behaviour. It does not invent the fact ([never-invent-facts](../principles/never-invent-facts.md)).

## Allowed self-references

This repository may cite its own issue and pull request numbers, `GH-<n>` and `#<n>`. It may cite an architecture decision id, `ADR-<n>`, and the placeholders `ACME-<n>` and `TICKET`.

The publisher scope in package metadata and install lines is `@shedcollective/neat-os`. The organisation scope is `@shedcollective`. Before 0.4.0 the package name was `@shedcollective/shed-os`.

The git SSH form `git@github.com` in an install line is the transport. The check treats it as transport, and it treats any other mailbox as a mailbox.

## Commits and pull requests

Commit messages, pull request titles, and pull request bodies follow this page.

Do not address the reader as the person to ask, tell, or ping (`ask me`, `tell me`, `ping me`). Do not claim a pull request, a repository, or an agent with `my` (`my PR`, `my repo`, `my agent`). In a public repository those phrases are internal chatter.

## What the check enforces

Writing is the first layer. [Write for a public reader](writing.md#write-for-a-public-reader) keeps names and chatter out of code comments, commit messages, docs, and pull request titles and bodies. The two layers below are the backstops.

`scripts/check-neutral.js` checks what this repository publishes in two layers. `scripts/check` runs it.

- Generic patterns need no list of names. The check flags a mailbox whose domain is not `example.*`, except in a commit message, plus a Slack id, a link to a Slack workspace, an Atlassian cloud host, a ticket key whose prefix is not `GH`, `ADR`, `ACME`, or `TICKET`, and the phrases in the previous section.
- Review covers what those patterns cannot see: a client, a client company, or a client project named in plain words, or a Slack thread or other internal discussion quoted without a link the pattern can match. No list of those names is kept, because a list would need maintaining. The pull request template is the review step for that layer ([.github/pull_request_template.md](../.github/pull_request_template.md)).

A Slack workspace link is a host under `slack.com` other than `api.slack.com`, which is Slack's public API documentation. A ticket key is a letter prefix and a number of at least two digits. A URL userinfo at `github.com` is the git transport, same as `git@github.com`.

The check reads every file in the tree except binary files. It does not apply the generic patterns to `scripts/check-neutral.js`, because that file holds them.

On a pull request, the check also reads the pull request title, the pull request body, the branch name, and the commit messages in the pull request range. The mailbox pattern applies to files, the title, the body, and the branch name. It does not apply to a commit message: an email address in the body or on a trailer line is allowed. Slack ids, Slack links, Atlassian hosts, ticket keys, and the chatter phrases still apply to commit messages. The branch name is not scanned for those other patterns, because they misread a slug. Editing the title or the body runs the check again. It does not read commits outside the pull request range, issues, comments, or reviews. Those are review. It reads commit messages, not commit authors.

The platform wraps the body in `<!-- CURSOR_AGENT_PR_BODY_BEGIN -->` and `<!-- CURSOR_AGENT_PR_BODY_END -->` and appends a footer after the end marker. The check reads only the text between the markers. The markers and the footer are platform boilerplate. A body without the markers is checked in full. The pull request body is not exempt. This page is the only file that may name the rejected phrases.

## Source

[ADR-0016](../docs/decisions/0016-neutral-reference.md), narrowed by [ADR-0023](../docs/decisions/0023-neutral-rule-guards-what-is-published.md).
