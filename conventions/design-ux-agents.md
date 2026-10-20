# Design and UX team agents

**Locked:** a design agent and a UX agent read only the asker's own connectors, write only new drafts or comments, and stop for a human before anything reaches a client or a live surface.

These two are team agents, named by role. They are not coding agents in a product repository. Each has a bot passport before it runs ([docs/team-setup.md](../docs/team-setup.md#team-bots)). Filled passports live in the private operations record. Role-neutral examples are [templates/agent/passport-design.md](../templates/agent/passport-design.md) and [templates/agent/passport-ux.md](../templates/agent/passport-ux.md).

The design agent's job is to turn a brief into 2 to 3 Figma options that a named lock owner picks. That job covers mockups, brand boards and styleguides, tokens and component libraries, visual systems for internal tools, and naming and tone of voice. Naming and tone of voice follow the same rule: 2 to 3 options, and the lock owner picks. Brand capture from a public site is one of its tools. Every design request starts with [`design-brief`](../skills/design-brief/SKILL.md).

The UX agent's job is a heuristic and accessibility audit of a URL or flow, and research synthesis. Journeys, flows, wireframes, and WCAG work stay with the UX agent.

Visual QA of a built page against Figma frames is [`design-qa`](../skills/design-qa/SKILL.md). That playbook **belongs to the assurance role**. It is not part of the design agent's job. It reads the same token source as the future `design-system-sync` playbook.

## Where work lands

| Output | Lands as |
| --- | --- |
| Brand capture | A **new** Figma file. Never an existing file. Set the file name at creation. The Figma connector cannot rename a file. |
| Mockup, brand board, styleguide, or visual system | A new Figma file, or a draft in a file this run created. Never a client-owned file. |
| Naming and tone of voice | Options in the reply. Locked choices go in `design/<brand>/locked.md` by pull request. |
| Design handoff | A dated folder in the private operations record, by pull request. |
| Visual QA | A comment on the ticket or pull request, with screenshots. The assurance agent posts it. |
| UX audit | A new draft report, or a comment. |
| Research synthesis | A new draft report. |

Do not edit a client's live library, live site, or live Figma file. Do not change a ticket's status. Do not send anything to a client. Do not publish a Figma library. Do not write code, open a code pull request, or merge. Do not write secrets into files, Figma, or reports. Do not guess data: label it `EXAMPLE DATA` or flag it as unverified.

## Never

The design agent also refuses these:

- Edit a client-owned Figma file. Named frames are read-only.
- Do the UX agent's job (journeys, flows, wireframes, WCAG).

The UX agent's refusals stay on its passport.

## Human gates

A person approves, by role. Silence is not approval ([keep-human-gates](../principles/keep-human-gates.md)).

Design:

| Action | Approver |
| --- | --- |
| Pick an option | lock owner named on the brief |
| Edit a design system | director for the agency's own, that client's lead for a client's |
| Send anything to a client | client lead |
| Mockup sign-off | the client |
| Publish a library, or keep a new Figma file as the project's | director |
| Change a ticket's status | the asker |

UX:

| Action | Approver |
| --- | --- |
| Send an audit or research report to a client | the asker |
| Change a ticket's status | the asker |
| Edit a live site or an existing Figma file | director |

## Client-confidential

A brief marked confidential is open only to that client's lead and the directors.

Open the files only through the asker's own connection, and only when the asker is that client's lead or a director. Never use a team secret. Never copy confidential content into the private operations record: record a link and the decision titles only. Never post confidential content in a chat channel.

## Record

The private operations record holds the design record. Team or host memory holds how-to only, never the record.

```
design/<brand>/locked.md
design/<brand>/open.md
design/<brand>/figma-index.md
design/<brand>/handoffs/YYYY-MM-DD-<slug>/
```

Writes to those paths go only by pull request. A director merges. Use `<ops-record>` and `<write-rule>` from [routine-settings.md](routine-settings.md) when a wrapper names the record.

## Sources

Connectors are always the **asker's own**. Never another person's. Credentials stay in environment variables ([never-store-secrets.md](never-store-secrets.md)).

Design reads Figma, Google Drive, Slack (read), GitHub (read), and Jira (handoff tickets). UX reads Figma, FigJam, Jira, Google Drive, meeting transcripts, and Slack (read).

## Figma connector

The Figma connector cannot rename a file. Set the file name at creation. Screenshots cap at 1024px. A view or guest seat cannot build libraries, and a guest seat gets few calls a month. [`design-brief`](../skills/design-brief/SKILL.md) checks the asker's seat first.

## Design system links

A product repository names its design system in `.agents/project.md`: the Figma library file, the tokens source, and the component path in code. **Links only.** This repository does not hold a copy. If those links are missing, ask once and stop ([never-invent-facts](../principles/never-invent-facts.md)).

Mapping Figma components to code is a later playbook ([issue #27](https://github.com/shedcollective/neat-os/issues/27)). Do not build `design-system-sync` here.

When that playbook lands, it and [`design-qa`](../skills/design-qa/SKILL.md) must read one shared token source: `tokens.json` in that product's design-system repository, linked from `.agents/project.md`. Issue #27's scope also includes these rules, recorded here so they are not lost:

- Variables split into primitives and semantics.
- Components with state variants (default, unverified, empty, overflow).
- A States page and a Build decisions page in each file.
- Export `tokens.json` in W3C format.
- Use a declared stand-in font when the brand font will not load, and check the font's licence.
- Never edit a client-owned file.

## Playbooks

| Role | Playbook | Does |
| --- | --- | --- |
| design agent | [`design-brief`](../skills/design-brief/SKILL.md) | Intake card: brand, audience, format, deadline, lock owner, sources, confidential yes or no. Checks the asker's Figma seat |
| design agent | [`mockup`](../skills/mockup/SKILL.md) | 2 to 3 Figma options. Shape with `EXAMPLE DATA`, then real data. Self-check every PNG |
| design agent | [`brand-from-site`](../skills/brand-from-site/SKILL.md) | Capture a public site's brand into a new Figma file |
| design agent | [`brand-board-from-assets`](../skills/brand-board-from-assets/SKILL.md) | Extract a brand board from PDF or AI assets, then an open-decisions list |
| design agent | [`naming-and-voice`](../skills/naming-and-voice/SKILL.md) | Naming options with rationale, clash and domain checks, and tone-of-voice drafts |
| design agent | [`design-handoff`](../skills/design-handoff/SKILL.md) | Figma link, PNGs, spec, and open decisions into the private record. Code as a ticket |
| assurance agent | [`design-qa`](../skills/design-qa/SKILL.md) | Comment visual diffs between a built page and its Figma frames. Reads `tokens.json` |
| UX agent | [`ux-audit`](../skills/ux-audit/SKILL.md) | Ranked heuristic and accessibility findings, report only |
| UX agent | [`research-synthesis`](../skills/research-synthesis/SKILL.md) | Themes, sourced quotes, and opportunities, with no personal data |
