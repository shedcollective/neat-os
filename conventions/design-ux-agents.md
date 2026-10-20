# Design and UX team agents

**Locked:** a design agent and a UX agent read only the asker's own connectors, write only new drafts or comments, and stop for a human before anything reaches a client or a live surface.

These two are team agents, named by role. They are not coding agents in a product repository. Each has a bot passport before it runs ([docs/team-setup.md](../docs/team-setup.md#team-bots)). Filled passports live in the private operations record. Role-neutral examples are [templates/agent/passport-design.md](../templates/agent/passport-design.md) and [templates/agent/passport-ux.md](../templates/agent/passport-ux.md).

## Where work lands

| Output | Lands as |
| --- | --- |
| Brand capture | A **new** Figma file. Never an existing file. |
| Visual QA | A comment on the ticket or pull request, with screenshots. |
| UX audit | A new draft report, or a comment. |
| Research synthesis | A new draft report. |

Do not edit a client's live library, live site, or live Figma file. Do not change a ticket's status. Do not send anything to a client. Do not publish a Figma library.

## Human gates

A person approves, by role:

| Action | Approver |
| --- | --- |
| Publish a library, or keep a new Figma file as the project's | director |
| Edit an existing Figma file, a live library, or a live site | director |
| Change a ticket's status | the asker |
| Send anything to a client | the asker |

Silence is not approval ([keep-human-gates](../principles/keep-human-gates.md)).

## Sources

Connectors are always the **asker's own**. Never another person's. Credentials stay in environment variables ([never-store-secrets.md](never-store-secrets.md)).

## Design system links

A product repository names its design system in `.agents/project.md`: the Figma library file, the tokens source, and the component path in code. **Links only.** This repository does not hold a copy. If those links are missing, ask once and stop ([never-invent-facts](../principles/never-invent-facts.md)). Mapping Figma components to code is a later playbook ([issue #27](https://github.com/shedcollective/neat-os/issues/27)). Do not build it here.

## Playbooks

| Role | Playbook | Does |
| --- | --- | --- |
| design agent | [`brand-from-site`](../skills/brand-from-site/SKILL.md) | Capture a public site's brand into a new Figma file |
| design agent | [`design-qa`](../skills/design-qa/SKILL.md) | Comment visual diffs between a built page and its Figma frames |
| UX agent | [`ux-audit`](../skills/ux-audit/SKILL.md) | Ranked heuristic and accessibility findings, report only |
| UX agent | [`research-synthesis`](../skills/research-synthesis/SKILL.md) | Themes, sourced quotes, and opportunities, with no personal data |
