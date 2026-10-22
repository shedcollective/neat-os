# Commit attribution

**Locked:** the author of a commit is the person who did the work. Nobody is listed, gated, or allowlisted.

When an agent writes the commit, the person who drove the session did the work. Before the first commit on a clone, set git's `user.name` and `user.email` to that person. Use an email address their GitHub account knows, so GitHub links the commit to them. Their GitHub noreply address, `<id>+<login>@users.noreply.github.com`, is one. The committer may be that person or a bot.

There is no list of people and no check of commit authors or committers. The neutral rule in [neutral-reference.md](neutral-reference.md) is about what this repository publishes, not about who is credited.

## No co-author trailer

Do not add a `Co-authored-by` trailer. The author field already names the person who did the work, and an AI tool is not an author.

A platform may append that trailer from a managed `commit-msg` hook. To stop it, point `core.hooksPath` at a hooks directory that does not contain the hook.

On a pull request, `scripts/check-neutral.js` fails a commit in the pull request range when a line of its message starts with `Co-authored-by:`. This is the only attribution check, and it is separate from the neutral rule. It reads commit messages only, and it does not read commits outside the pull request range. History on `develop`, `main`, and tags stays as it is.

## Source

[ADR-0023](../docs/decisions/0023-neutral-rule-guards-what-is-published.md).
