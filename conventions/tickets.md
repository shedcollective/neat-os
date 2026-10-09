# Ticket systems

**Locked:** a ticket lives where the people who must act on it work.

| Repo kind | Ticket system | Key shape |
| --- | --- | --- |
| Client / product repos | **Jira** (the PM layer, estimates, Client QA, deployment sign-off live there) | Jira key, e.g. `ACME-123` |
| `neat-os` and OS leaves (`neat-os-platform-*`, `neat-os-tool-*`) | **GitHub Issues** in that repo | `GH-<n>`, e.g. `GH-42` |

What goes inside a ticket, and how it is written for the client to read, is in [ticket-content.md](ticket-content.md).

Jira exists for client accountability: estimates are sold, Client QA is signed, DeployHQ is pressed. OS repos have no client, no sold estimate and no Client QA; their only actors are developers and agents, whose surface is GitHub (issues link to PRs and ADRs, `learn` reads merge history, Cloud Agents read `gh issue view`).

## Edge

If OS work is commercially scheduled (a pilot promised to a client by a date), the *engagement* is a Jira ticket; the *implementation* still tracks as GitHub issues. Same rule, not an exception.

## Where the key goes

- Branch: lowercase key, e.g. `feature/acme-123-checkout-fix`, `feature/gh-42-taxonomy`
- Commit / single PR title: Conventional Commits with the key in the subject or footer (`feat(gather): … (GH-42)`)
- Stacked PRs: feature branch `[GH-42] feat: <description>`, steps `[GH-42] (<step>/<total>) <type>: <description-of-step>` (see [git.md](git.md#stacked-prs))
- GitHub Issues only: the pull request that targets `develop` includes a closing keyword in its body (`Closes #<n>`) so the issue's Development section lists the PR and merging into `develop` closes the issue. A bracketed title or a commit footer is not enough. Stacked step PRs keep `part of #<issue>` and do not use a closing keyword. Do not put a closing keyword on a Jira-keyed product-repo PR.
- PR title: `[GH-42] feat: <description>`; stacked steps `[GH-42] (<step>/<total>) <type>: <description-of-step>` (see [git.md](git.md#pr-titles))
- Feature plan: `.agents/features/<key>-overview.md` with the key lowercase (`acme-123-overview.md`, `gh-42-overview.md`)

## Project vs company

| Fact | Where |
| --- | --- |
| Which system an OS repo uses | Here (do not ask in `gather`) |
| A client repo's Jira prefix | Project `.agents/project.md`. `gather` asks, or marks `TODO / ask` |
| A PM-layer view of OS effort | Not built. Add a single Jira epic only if the PM layer asks for one. |
