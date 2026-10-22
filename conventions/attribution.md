# Commit attribution

**Locked:** the git author of a commit is the person who drove the agent session. There is no shared author.

The author field names that person. Their git email is their own GitHub noreply address, in the form `<id>+<login>@users.noreply.github.com`. The id is the numeric GitHub user id. The login is their GitHub login.

## Per clone

Before the first commit on a clone, set git's `user.name` and `user.email` to that person. `user.email` is the address above.

A platform may append a `Co-authored-by` trailer from a managed `commit-msg` hook. Do not add that trailer. The author field does that job. Point `core.hooksPath` at a hooks directory that does not contain the hook, so the trailer is not added.

Do not add a `Signed-off-by` trailer.

## Addresses the check rejects

The check script holds the address list, because a mailbox written on this page would fail the tree scan. Rejected for both the author and the committer:

- The GitHub noreply address whose local part is `noreply`. It credits an unrelated GitHub account with that login.
- The GitHub noreply address whose local part is `neat-os-build`.
- The Cursor agent mailbox whose local part is `cursoragent` on `cursor.com`.

An author address on the domain `users.noreply.github.com` must be on the allowlist below. Any other author address on that domain fails, including the login-only form that has no numeric id.

The committer may be GitHub's web-merge address: local part `noreply` on `github.com`. That address is not an author address. A missing author email or a missing committer email fails.

## Allowlist

`TEAM_NOREPLY` in `scripts/check-neutral.js` is the allowlist: the short list of accepted GitHub noreply addresses. Each entry is a login and a numeric id. The accepted author address is the id, a plus sign, and the login, on `users.noreply.github.com`.

To add a person:

1. Read `id` and `login` from `https://api.github.com/users/<login>`.
2. Add one object `{ login, id }` to `TEAM_NOREPLY`.
3. Run `bash scripts/check`. The self-test accepts every address the array builds. It rejects the two GitHub noreply addresses named above, and it rejects a co-author trailer.

Do not copy the array into another file. The script is the list. Open it to see who is on it.

## What the check enforces

On a pull request, `scripts/check-neutral.js` reads each commit in the pull request range. It does not read commits outside that range. History already on `develop`, `main`, and tags stays as it is.

For each of those commits the check fails when the message contains a `Co-authored-by` line, when the author or committer email is one of the rejected addresses, or when the author email is on `users.noreply.github.com` and is not built from `TEAM_NOREPLY`. The same script still scans the tree, the pull request body, and the commit message for client names and internal chat ([neutral-reference.md](neutral-reference.md)).

## Source

[ADR-0023](../docs/decisions/0023-commit-attribution.md).
