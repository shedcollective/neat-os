# 0023 — The neutral rule guards what is published, not who is credited

**Status:** Accepted
**Date:** 2026-10-22

## Context

[ADR-0016](0016-neutral-reference.md) made this public tree a neutral reference: it named roles instead of people, and its check flagged GitHub logins. [Issue #38](https://github.com/shedcollective/neat-os/issues/38) found that agent commits used a shared author whose GitHub noreply address credited an unrelated account. On 22 October 2026 the repository owner decided that the person who drove an agent session is the author of its commits, with no co-author trailer. The first version of [pull request #51](https://github.com/shedcollective/neat-os/pull/51) enforced that with an allowlist of team noreply addresses and a list of blocked addresses. The owner rejected it. The neutral rule exists to keep Shed's business out of the public repository, not to decide who may be credited. A list of client names has its own problem: committed to the tree, it publishes the names it guards. That is why an earlier denylist was removed when the tree was named shed-os, and why ADR-0016 deferred one.

## Decision

The neutral rule keeps Shed's business out of what this repository publishes: client names, client companies, client projects, Slack links and quotes, and internal discussion. It does not cover people. A person's name, a commit author, and a GitHub login may appear.

`scripts/check-neutral.js` checks file contents and paths, pull request titles and bodies, and the commit messages in a pull request, in three layers. Generic patterns need no names: mailboxes outside `example.*`, Slack ids, Slack workspace links, Atlassian cloud hosts, ticket keys other than this repository's own, and first-person chatter. A private term list of client, client company, and client project names comes from the Actions secret `NEAT_OS_PRIVATE_TERMS`, which the existing `validate` job passes to the script. The script never prints a term or the number of terms, and it redacts each match in a hit. Review covers the rest. The rule that flagged a GitHub login is removed, because it policed people.

A secret was chosen over two other ways to keep the list out of the tree. A private repository holding the list needs a token that can read it, and the public workflow would name that repository. A list of hashes in the tree hides the plain names, but a short name can be recovered by hashing candidates. Generic patterns alone cannot find a name.

Attribution is plain. The real author is the author, and nobody is listed, gated, or allowlisted. Nothing checks commit authors or committers. The ban on a co-author trailer stays, because it is about honest authorship. It is a separate rule: one check on the commit messages in a pull request, outside the neutral scan.

The rules are [conventions/neutral-reference.md](../../conventions/neutral-reference.md) and [conventions/attribution.md](../../conventions/attribution.md).

## Consequences

ADR-0016 is partially superseded. Its rule that the repository names roles, not people, products, or bots, and its deferral of a name list, are replaced. Its rule that client facts and internal chatter stay out, and its check of the tree, the pull request body, and the commit messages, still hold.

The private layer does nothing until a person sets the secret. GitHub does not pass secrets to a pull request from a fork, so the layer is skipped there and review covers it. For the same reason, nobody outside this repository's own branches can use the check to test whether a name is on the list.

The check now also reads the pull request title, and editing the title or the body runs it again.

There is no shared bot identity, no allowlist, and no blocked address. History on `develop`, `main`, and tags is not rewritten. An owned identity is still wanted for the assurance agent to edit its own evidence pack, which is [issue #50](https://github.com/shedcollective/neat-os/issues/50).
