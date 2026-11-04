# 0023 — The neutral rule guards what is published, not who is credited

**Status:** Accepted
**Date:** 2026-10-22

## Context

[ADR-0016](0016-neutral-reference.md) made this public tree a neutral reference: it named roles instead of people, and its check flagged GitHub logins. [Issue #38](https://github.com/shedcollective/neat-os/issues/38) found that agent commits used a shared author whose GitHub noreply address credited an unrelated account. On 22 October 2026 the repository owner decided that the person who drove an agent session is the author of its commits, and at that time rejected a co-author trailer. On 4 November 2026 the owner reversed the trailer part: a trailer is acceptable, including one that names an AI tool, because the repository does not hide AI involvement. The first version of [pull request #51](https://github.com/shedcollective/neat-os/pull/51) enforced the 22 October authorship decision with an allowlist of team noreply addresses and a list of blocked addresses. The owner rejected it. The neutral rule exists to keep Shed's business out of the public repository, not to decide who may be credited. A list of client names has its own problem: committed to the tree, it publishes the names it guards. That is why an earlier denylist was removed when the tree was named shed-os, and why ADR-0016 deferred one.

## Decision

The neutral rule keeps Shed's business out of what this repository publishes: client names, client companies, client projects, Slack links and quotes, and internal discussion. It does not cover people. A person's name, a commit author, and a GitHub login may appear.

`scripts/check-neutral.js` checks file contents and paths, pull request titles and bodies, branch names, and the commit messages in a pull request, in three layers. Generic patterns need no names: mailboxes outside `example.*`, Slack ids, Slack workspace links, Atlassian cloud hosts, ticket keys other than this repository's own, and first-person chatter. The mailbox pattern does not apply to commit messages. It still applies to files, pull request titles, pull request bodies, and branch names. The other generic patterns still apply to commit messages. A branch name is scanned for private terms and mailboxes only, because the other patterns misread a slug. A private term list of client, client company, and client project names comes from the Actions secret `NEAT_OS_PRIVATE_TERMS`, which the existing `validate` job passes to the script. The script never prints a term or the number of terms, and it redacts each match in a hit. Review covers the rest. The rule that flagged a GitHub login is removed, because it policed people.

A secret was chosen over two other ways to keep the list out of the tree. A private repository holding the list needs a token that can read it, and the public workflow would name that repository. A list of hashes in the tree hides the plain names, but a short name can be recovered by hashing candidates. Generic patterns alone cannot find a name.

Attribution is plain. The real author is the author, and nobody is listed, gated, or allowlisted. Nothing checks commit authors or committers. A `Co-authored-by` trailer is allowed, including one that names an AI tool, because this repository does not hide AI involvement. The check does not fail a commit for that trailer. An email address in a commit message is allowed, in the body or on a trailer line.

The rules are [conventions/neutral-reference.md](../../conventions/neutral-reference.md) and [conventions/attribution.md](../../conventions/attribution.md).

## Consequences

ADR-0016 is partially superseded. Its rule that the repository names roles, not people, products, or bots, and its deferral of a name list, are replaced. Its rule that client facts and internal chatter stay out, and its check of the tree, the pull request body, and the commit messages, still hold.

The private layer does nothing until a person sets the secret. GitHub does not pass secrets to a pull request from a fork, so the layer is skipped there and review covers it. For the same reason, nobody outside this repository's own branches can use the check to test whether a name is on the list.

The check now also reads the pull request title, and editing the title or the body runs it again.

There is no shared bot identity, no allowlist, and no blocked address. A co-author trailer is not a failure, and neither is an email address in a commit message. History on `develop`, `main`, and tags is not rewritten. An owned identity is still wanted for the assurance agent to edit its own evidence pack, which is [issue #50](https://github.com/shedcollective/neat-os/issues/50).
