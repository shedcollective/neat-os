# Code comments

**Locked:** a prose comment states the behaviour that is true now and the constraint that makes it true.

This page is the rule for those comments in a Shed repository. Commit messages, pull request titles, and pull request bodies still follow [writing.md](writing.md#write-for-a-public-reader) and [git.md](git.md). They carry the ticket key. A prose comment does not.

The page serves the first aim of [PURPOSE.md](../PURPOSE.md): a person can trust the comment without reconstructing the change.

## Prose comment

A prose comment is a comment a person reads to understand the code. A documentation block that describes the current file, type, or function is a prose comment. It states the behaviour that is true now. It may state the causal constraint the code cannot omit, such as a protocol rule, an ordering requirement, or a failure mode.

A prose comment does not carry a ticket key, a pull request number, a branch name, or a review or prototype narrative. The commit and the pull request are where that context lives.

There is no line cap on a comment or a file header. A numeric cap would be raised the first time a real file needed another line ([ADR-0018](../docs/decisions/0018-no-numeric-principle-cap.md)).

## Not a prose comment

These stay as the tool or the licence requires. This page does not rewrite them into a change story, and it does not treat them as one.

- A compiler, typechecker, or other toolchain directive that the tool reads from comment syntax. A triple-slash reference and a `@ts-expect-error` or `@ts-ignore` directive are examples. A `@license` marker the toolchain keeps is the same kind of line.
- A licence, copyright, or SPDX line.
- A banner a generator writes to mark the file as generated.
- A citation of the public standard, language manual, or API contract the code implements. `RFC 9110`, `PSR-4`, and a URL on `https://www.php.net/` or `https://html.spec.whatwg.org/` are current constraints. They do not use the external-bug form below.

When a directive line also contains a sentence for a person, the directive stays and the sentence follows this page.

## Runtime conditions

A prose comment may use `until`, `while`, or `pending` when the word names a condition of the running system. Waiting until a socket is ready, or holding a lock while a write finishes, is that kind of condition.

Unfinished work that a person still has to do uses the open-work form below. An aside such as `for now` is a temporary status. When the work is still open, use `TODO(<issue-url>)`. When the constraint is already the current behaviour, delete the aside and keep the constraint.

## Open work

The form is `TODO(<issue-url>)`.

`<issue-url>` is an absolute `http://` or `https://` URL of the issue that tracks the unfinished work. A bare key, such as `GH-42` or `ACME-123`, is not this form.

The comment may state the current constraint beside that form. It still omits branch names, pull request numbers, and review rounds.

## External bug

The form is `bug(<url>)`.

`<url>` is an absolute `http://` or `https://` URL of a public defect report for a dependency, a language, or a specification. The comment states the constraint that defect imposes on the current code. A specification or API contract the code implements uses the citation rule above, not this form.

## Temporary upstream patch

The form is `Temporary upstream patch. TODO(<issue-url>).`

[stacks/nails/fix-at-source.md](../stacks/nails/fix-at-source.md) requires this form when a product change is blocked on a Nails package and a temporary app patch is the only way to proceed. The comment may add the current constraint. The product pull request says the patch is temporary and links the same issue. The pull request may use the ticket key, as [writing.md](writing.md#write-for-a-public-reader) describes for pull requests.

## Responsibility header

When a hand-written source file has a top comment that says what the file is for, that comment states the file's responsibility. It may include the causal constraint the file cannot omit. It does not name a ticket, a pull request, a branch, or a review round.

When a change makes that statement false, update the header in the same pull request. Update a README or Agent Guide sentence that states the same fact in that same pull request ([keep-the-guide-true](../principles/keep-the-guide-true.md)). This rule does not add a header to a file that has none, and it does not rewrite untouched files.

A licence header and a generated-file banner are exempt. A file may carry one of those and a responsibility header. Leave the licence or generated banner as its author requires.

## Replacing a design

When a change replaces a design, restate the current design and remove the superseded path in that change. Delete or rewrite comments that described only the superseded behaviour. Keep a comment whose constraint still applies to the code that remains.

A revert is the same kind of change. Delete or rewrite comments that described only the behaviour the revert removes. Keep a comment that still explains the restored code.

Nothing in this rule counts edits. A second edit does not by itself require a rewrite. Read the current design first, and keep the diff to the path the change replaces ([inspect-before-inventing](../principles/inspect-before-inventing.md), [smallest-complete-change](../principles/smallest-complete-change.md)).

When a comment already contains a ticket key, a pull request number, or a branch name, check it against the current code. Delete or rewrite it when it describes behaviour the file no longer has. Leave it when the constraint still holds. This rule is not a request to add those references.

## Review

Review applies this page. Policy `written-for-a-reader-with-only-the-repo` in `scripts/check-policy.js` does not parse code comments, and this page does not add a policy. The policy list stays at ten.

A warning on added comments is [issue #71](https://github.com/shedcollective/neat-os/issues/71). Configured size budgets are [issue #73](https://github.com/shedcollective/neat-os/issues/73). A limited token match for a comment-only diff is [issue #75](https://github.com/shedcollective/neat-os/issues/75). An on-demand guide check is [issue #72](https://github.com/shedcollective/neat-os/issues/72). Stripping comments does not show that behaviour is unchanged ([evidence-before-done](../principles/evidence-before-done.md)). Feature docs stay on [issue #57](https://github.com/shedcollective/neat-os/issues/57).

## Source

[ADR-0026](../docs/decisions/0026-code-comments-state-current-behaviour.md). [Issue #74](https://github.com/shedcollective/neat-os/issues/74).
