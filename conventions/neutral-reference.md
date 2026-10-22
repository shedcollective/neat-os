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

`scripts/check-neutral.js` checks what this repository publishes in three layers. `scripts/check` runs it.

- Generic patterns need no list of names. The check flags a mailbox whose domain is not `example.*`, a Slack id, a link to a Slack workspace, an Atlassian cloud host, a ticket key whose prefix is not `GH`, `ADR`, `ACME`, or `TICKET`, and the phrases in the previous section.
- Private terms are the names of clients, client companies, and client projects. They come from a list that is never committed, described in [Private terms](#private-terms).
- Review covers what software cannot see: a quote from a Slack thread without its link, a project described without its name, or a client that is not on the list yet.

A Slack workspace link is a host under `slack.com` other than `api.slack.com`, which is Slack's public API documentation. A ticket key is a letter prefix and a number of at least two digits. A URL userinfo at `github.com` is the git transport, same as `git@github.com`.

The check reads every file in the tree except binary files. It does not apply the generic patterns to `scripts/check-neutral.js`, because that file holds them. It applies the private terms to every file, that one included, and to every file path, so the list cannot be added to the check.

On a pull request, the check also reads the pull request title, the pull request body, and the commit messages in the pull request range, with both layers. It reads the branch name for private terms only, because the branch name lands in the merge commit message. Editing the title or the body runs the check again. It does not read commits outside the pull request range, issues, comments, or reviews. Those are review. It reads commit messages, not commit authors.

The platform wraps the body in `<!-- CURSOR_AGENT_PR_BODY_BEGIN -->` and `<!-- CURSOR_AGENT_PR_BODY_END -->` and appends a footer after the end marker. The check reads only the text between the markers. The markers and the footer are platform boilerplate. A body without the markers is checked in full. The pull request body is not exempt. This page is the only file that may name the rejected phrases.

## Private terms

The private term list is the names of clients, client companies, and client projects. It is the Actions secret `NEAT_OS_PRIVATE_TERMS` on this repository, and the `validate` job passes it to `scripts/check`. The list is never committed, not even inside the check.

The secret holds one term per line. A line that starts with `#` is a comment. A term matches as a whole word, in any case. Spaces, hyphens, and underscores in a term match any run of those characters, or none, so `Example Project` also matches `example-project` and `ExampleProject`. Every match fails the check, so add the most specific form of a name.

The check never prints a term or the number of terms. A hit names the file or the pull request field, and the line number. Another hit on the same line prints with each match replaced by `<private>`.

When the secret is not set, the check skips this layer and says so. That is the case on a laptop, and on a pull request from a fork, because GitHub does not pass secrets to a pull request from a fork. Review covers those.

To change the list:

1. Edit the source copy in the private operations record. Do not keep a copy in a clone of this repository.
2. Run `gh secret set NEAT_OS_PRIVATE_TERMS --repo shedcollective/neat-os < <path-to-list>`.
3. Re-run the `validate` job on an open pull request.

To run the same layer on a laptop, run `NEAT_OS_PRIVATE_TERMS="$(cat <path-to-list>)" bash scripts/check`.

## Source

[ADR-0016](../docs/decisions/0016-neutral-reference.md), narrowed by [ADR-0023](../docs/decisions/0023-neutral-rule-guards-what-is-published.md).
