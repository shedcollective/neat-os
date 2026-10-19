# Decisions

Architecture decision records for neat-os. One file per decision, numbered, never edited after acceptance except to change **Status** (superseded by / partially superseded by / deprecated). A new decision that reverses an old one gets a new number and links back. A decision that reverses only part of an old one sets that record's status to `Partially superseded by NNNN`. The new record says which part it replaces. The rest of the earlier record still holds.

Decisions below keep the product name that was true when they were accepted. From 0.4.0 that name is neat-os. Current package names, the git pin, and the resolve order, including the deprecated `SHED_OS_ROOT` fallback, are in [consume.md](../consume.md). The filename `0013-stack-packs-in-shed-os.md` is unchanged.

GitHub Issues hold the discussion, pull requests hold the change, and this folder holds the reasons. Nothing here links to notes kept outside the repository ([0008](0008-repo-is-source-of-truth.md)).

Format: [0000-template.md](0000-template.md). `scripts/check-structure.js` asserts this index matches the files present.

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-consume-via-git-not-packages.md) | Consume shed-os via git (sibling / `github:` / Composer VCS), not a Packages registry | Superseded by 0017 |
| [0002](0002-launch-skill-split.md) | Three launch playbooks: `init` scaffolds, `gather` fills and interviews, `learn` proposes | Accepted |
| [0003](0003-resolve-order.md) | Locked resolve order: `SHED_OS_ROOT` → `node_modules` → `vendor` → sibling; stop at first hit; no web search | Accepted |
| [0004](0004-ide-spread-no-skill-copy.md) | Keep the IDE spread in product repos; never copy company skills into a client | Accepted |
| [0005](0005-merge-commits-not-squash.md) | Merge commits, not squash | Accepted |
| [0006](0006-three-goals.md) | Kaizen, Determinism, Parallelism are the goals; principles sit beneath them | Accepted |
| [0007](0007-github-issues-for-os-repos.md) | GitHub Issues for shed-os and OS leaves; Jira stays for client repos | Accepted |
| [0008](0008-repo-is-source-of-truth.md) | The repository is the source of truth for docs, decisions and releases; Notion is a scratchpad | Accepted |
| [0009](0009-writing-convention.md) | Reader-facing pages are written for a developer who has only the repository; the subset software can see is checked | Accepted |
| [0010](0010-first-installable-tag.md) | `v0.1.0` is the first installable tag; `v0.0.1` is not | Accepted |
| [0011](0011-principle-set-cap-twelve.md) | Principle set cap is twelve | Superseded by 0018 |
| [0012](0012-ticket-playbook-writes-jira-not-the-repo.md) | The `ticket` playbook creates or enhances a Jira Task and writes nothing to the repository | Accepted |
| [0013](0013-stack-packs-in-shed-os.md) | Stack packs live in shed-os; init and gather point at them | Accepted |
| [0014](0014-commit-shape-for-review.md) | Commits are one concern, explained, and ordered for review | Accepted |
| [0015](0015-ticket-titles-name-a-capability-or-a-breakage.md) | Ticket titles name a new capability or a breakage | Accepted |
| [0016](0016-neutral-reference.md) | The public tree is a neutral reference | Accepted |
| [0017](0017-consume-via-github-packages.md) | Client repositories consume shed-os from GitHub Packages | Partially superseded by 0019 |
| [0018](0018-no-numeric-principle-cap.md) | The principle set has no numeric cap | Accepted |
| [0019](0019-publish-github-packages.md) | Publish neat-os to GitHub Packages on a release | Accepted |
