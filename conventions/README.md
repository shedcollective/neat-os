# Company conventions

Locked engineering defaults for Shed. These are company knowledge: `gather` must not re-ask them as if they were project choices.

| Convention | File |
| --- | --- |
| Git workflow is always **git-flow** | [git.md](git.md) |
| Commit attribution: the author is the person who drove the session | [attribution.md](attribution.md) |
| Tickets: Jira for product repos, GitHub Issues for OS repos | [tickets.md](tickets.md) |
| Ticket content: a Task that describes the problem and the outcome, written for the client to read | [ticket-content.md](ticket-content.md) |
| Writing: pages are written for a reader who has only the repository | [writing.md](writing.md) |
| Neutral reference: keep client names, client projects, and internal chat out of this repository | [neutral-reference.md](neutral-reference.md) |
| Never store secrets, credentials, or project-specific information in this repository | [never-store-secrets.md](never-store-secrets.md) |
| Agent work logging: shared digests log work only; no personal chatter, billing amounts, or secrets | [agent-work-logging.md](agent-work-logging.md) |
| Routine settings: the fixed names a routine supplies to an agency operations playbook | [routine-settings.md](routine-settings.md) |
| The lockfile beside a manifest names the installer for that directory | [lockfile.md](lockfile.md) |
| Design and UX team agents: asker's connectors, 2 to 3 options, human gates, private record | [design-ux-agents.md](design-ux-agents.md) |

## Where a fact belongs

- A fact that is true for every Shed repo belongs in this folder. Playbooks read it and templates inherit it.
- A fact about one project (the client, the stack, the ticket prefix, an unusual integration branch name) belongs in that repo's `.agents/project.md` and `AGENTS.md`.
- How those two kinds of fact relate is described in [schema/](../schema/README.md).
- Why a convention exists is recorded in [docs/decisions/](../docs/decisions/README.md).
- How this repo ships is a process, not a convention. It is described in [docs/release.md](../docs/release.md).

Do not keep a company fact only inside a playbook. Playbooks go stale. This folder is the source of truth.
