# Commit attribution

**Locked:** the author of a commit is the person who did the work. Nobody is listed, gated, or allowlisted.

When an agent writes the commit, the person who drove the session did the work. Before the first commit on a clone, set git's `user.name` and `user.email` to that person. Use an email address their GitHub account knows, so GitHub links the commit to them. Their GitHub noreply address, `<id>+<login>@users.noreply.github.com`, is one. The committer may be that person or a bot.

There is no list of people and no check of commit authors or committers. The neutral rule in [neutral-reference.md](neutral-reference.md) is about what this repository publishes, not about who is credited.

A `Co-authored-by` trailer is allowed, including one that names an AI tool. This repository does not hide AI involvement. The check does not fail a commit for that trailer. What the neutral check still flags in a commit message is in [neutral-reference.md](neutral-reference.md#what-the-check-enforces).

## Source

[ADR-0023](../docs/decisions/0023-neutral-rule-guards-what-is-published.md).
