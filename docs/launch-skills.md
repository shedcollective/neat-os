# The playbooks

`init`, `gather`, and `learn` bring a repository into neat-os and keep it there. `ticket` puts work into Jira in a shape the client can read. Two more playbooks live beside them: `assurance` and `pin-majors-with-reasons`. Each is a playbook: an ordered list of steps with a stopping point, written in the `SKILL.md` format that Cursor discovers, and stored under [`skills/`](../skills/). The split between the first three is locked by [ADR-0002](decisions/0002-launch-skill-split.md), `ticket` by [ADR-0012](decisions/0012-ticket-playbook-writes-jira-not-the-repo.md), and the kinds of file are defined in [schema/README.md](../schema/README.md).

| Playbook | Does | Refuses to |
| --- | --- | --- |
| [`init`](../skills/init/SKILL.md) | Copies the template files into the product repository: `AGENTS.md`, the Agent Guide at `.agents/README.md`, and the empty folders for docs, features, platforms, and proposals. Checks that neat-os can be found. Leaves **Stack packs** as "None yet". | Scan the repository. Ask for a ticket prefix. Fill in any fact about the client or the stack. Copy skill files into `.agents/skills/`. Copy `stacks/` into the product repo. |
| [`gather`](../skills/gather/SKILL.md) | Scans the repository for evidence, then interviews you. Fills the Agent Guide and `.agents/project.md`. Writes one guide per platform under `.agents/platforms/` when the tree shows more than one, for example a separate frontend and backend. Fills **Stack packs** when the tree matches a `stacks/<name>/` pack in neat-os. | Declare itself finished after the scan. Ask about company conventions such as git-flow. Copy skill files. Copy `stacks/`. Do the job of `learn`. |
| [`learn`](../skills/learn/SKILL.md) | Reads recent commits and merges and drafts proposals for what could become a shared principle or playbook, under `.agents/proposals/`. | Fill project facts. Push anything to neat-os, a platform repository, or any shared skill store. Open the pull request that would elevate a proposal. A person does that. |
| [`ticket`](../skills/ticket/SKILL.md) | Creates a Jira Task from a brief, or enhances an existing ticket, in the sections and tone locked by [conventions/ticket-content.md](../conventions/ticket-content.md). The body is the decided outcome. Reads the project's Tickets slot for the client's vocabulary and standing acceptance criteria. May read the repository for pointers. | Write anything to the repository. Set an estimate, priority, status or assignee. Use an issue type other than Task. Describe how to implement the change. Create a ticket with a guessed or placeholder section. Copy the request, the discussion, or an earlier draft into the ticket. |

## `init` creates the files

Run it on a git repository that has no `AGENTS.md` or `.agents/` folder, or is missing some of the files inside it. It skips files that already exist and lists them. To replace a file, ask the person first, then re-run with `--force`.

Find neat-os with the resolve order in [consume.md](consume.md), then run the copy script from wherever it was found:

```bash
bash node_modules/@shedcollective/neat-os/skills/init/scripts/copy-templates.sh
```

In a Cloud Agent Environment the path starts with `../neat-os/` instead of `node_modules/@shedcollective/neat-os/`. The same applies to every path on this page.

The copied Agent Guide is a template. The sections about Docker, the Makefile, a nested `www/` application root, and the stack are filled by `gather`, not by `init`.

## `gather` fills them

`gather` has two jobs, in order. First it scans the repository for evidence and writes what it finds:

```bash
bash node_modules/@shedcollective/neat-os/skills/gather/scripts/light-scan.sh
```

Then it interviews you for what the tree cannot show. The scan on its own is not a finished `gather`. The playbook is complete only when Client and Product in `.agents/project.md` are real answers, not blank and not "Awaiting interview".

| Where it runs | How the interview happens |
| --- | --- |
| Cursor IDE, with you present | Questions in the chat. The answers are written into the same files the scan filled. |
| Cloud Agent | There is nobody to ask. If the prompt already contains the answers, they are used. Otherwise `gather` leaves "Awaiting interview" in place, reports itself incomplete, and stops. A ticket prefix can also be given with `--ticket-prefix` or the `NEAT_OS_TICKET_PREFIX` environment variable. |

OS repositories (`neat-os`, `neat-os-tool-*`) get the ticket prefix `GH` from [conventions/tickets.md](../conventions/tickets.md) without being asked. A product repository gets its Jira prefix from the interview, from the flag, or keeps a `TODO / ask` marker until someone answers.

Three markers can appear in the files `gather` writes. "Awaiting interview" means a fact that only a person can supply is still missing, such as Client or Product. `TODO / ask` marks the ticket prefix when nothing supplied it. `to confirm` marks a fact the scan inferred from the tree that a person should check.

If a repository already has a hand-written Agent Guide, `gather` cites it and does not overwrite it. Run `gather` again after a Makefile, a Compose file, or a CI workflow is added, so the evidence sections catch up. Interview answers survive the re-run.

## `learn` proposes

`learn` has no script. An agent follows `skills/learn/SKILL.md`, which runs `git log` over the last 50 commits and the last 20 merges into `develop` by default. Each portable candidate becomes a draft under `.agents/proposals/` with a name, what the rule locks, where it would live in neat-os, and why it must not be merged automatically. Drafts that are meant for neat-os are **project-agnostic**: they do not name a client, a product path, or a ticket from the repo under audit. Elevating a proposal into neat-os is a pull request that a person opens, as [propose-never-promote](../principles/propose-never-promote.md) requires.

`learn` is not `gather`. It does not run the evidence scan and does not write about Docker, the Makefile, or the stack into project files.

## `ticket` writes to Jira

`ticket` has no script. An agent follows `skills/ticket/SKILL.md`. Give it a brief in your words, or a ticket key to enhance:

```text
Follow node_modules/@shedcollective/neat-os/skills/ticket/SKILL.md.
Customers cannot download invoices from the order history page since Tuesday. Create it.
```

The agent reads [conventions/ticket-content.md](../conventions/ticket-content.md) and the Tickets section of `.agents/project.md`, drafts the ticket in the locked sections (Title, More information needed when the request is unclear, Why, What, How to replicate for a bug, Out of scope, Acceptance criteria, Links, Attachments), and writes only the final decided outcome, stated as fact. It checks the tone, and creates a Jira Task with the tool the agent already has. If you have said "create it", it creates without waiting. If you have not, it shows the draft and waits. If a required section is still unknown after asking, the ticket goes in anyway with a More information needed section that lists the open questions and who can answer each one, the client contact or the reporter. Nothing is guessed.

The ticket describes the problem and the outcome, not the build. The developer who picks it up decides how, and writes the feature plan under `.agents/features/` then. `ticket` writes nothing to the repository. It sets no estimate, priority, status or assignee; a person triages the ticket from the first column.

For an OS repository the same playbook writes a GitHub Issue with `gh issue create`, because that is where OS tickets live ([conventions/tickets.md](../conventions/tickets.md)). neat-os ships the playbook only, not a Jira client. The agent needs Jira or `gh` access from its own environment.

## `assurance` and `pin-majors-with-reasons`

These two are playbooks, and they are not part of adoption. `assurance` reads one pull request on a product repository and posts an evidence pack. It does not implement the change. `pin-majors-with-reasons` upgrades dependencies and leaves a pinned major where it is. Their steps are in [`skills/assurance/SKILL.md`](../skills/assurance/SKILL.md) and [`skills/pin-majors-with-reasons/SKILL.md`](../skills/pin-majors-with-reasons/SKILL.md).


## Agency operations playbooks

`daily-burndown`, `enhance-daily-update`, `project-update`, `client-brief`, `meeting-prep`, `bids-register`, `finance-client-backfill`, `finance-client-sync`, and `finance-lookup` are on-demand playbooks for shared operations work. They are not part of product-repo adoption. Their map, the work-logging convention, and the burndown day template are in [agency-ops.md](agency-ops.md).

`daily-digest` is also an on-demand agency operations playbook. It runs after the day file is written and turns it into a short end-of-day post. `morning-brief` is the weekday morning message for one person (Needs you, Today, Meetings, Health, Pipeline on Mondays). It does not replace `daily-digest`. The composition rule is in [agency-ops.md](agency-ops.md).

## Design and UX playbooks

`design-brief`, `mockup`, `brand-from-site`, `brand-board-from-assets`, `naming-and-voice`, and `design-handoff` are on-demand playbooks for the design agent. `design-qa` is an on-demand playbook for the assurance role. `ux-audit`, `research-synthesis`, and `wireframes` are on-demand playbooks for the UX agent. They are not part of product-repo adoption. The rules are [conventions/design-ux-agents.md](../conventions/design-ux-agents.md).

## Order on a product repository

For a new repository: install neat-os ([consume.md](consume.md)), run `init`, run `gather`, then start feature work on `develop`. Run `ticket` whenever work needs to reach Jira. Run `learn` after a stretch of work when you want to know what could be shared.

For an existing repository: install neat-os and check the install works before running `init`. Then run `init`, which will not overwrite what is there, and `gather` with the interview. The team-level steps are in [team-setup.md](team-setup.md).
