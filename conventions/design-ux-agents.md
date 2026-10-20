# Design and UX team agents

**Locked:** a design agent and a UX agent read only the asker's own connectors, write only new drafts or comments, and stop for a human before anything reaches a client or a live surface.

These two are team agents, named by role. They are not coding agents in a product repository. Each has a bot passport before it runs ([docs/team-setup.md](../docs/team-setup.md#team-bots)). Filled passports live in the private operations record. Role-neutral examples are [templates/agent/passport-design.md](../templates/agent/passport-design.md) and [templates/agent/passport-ux.md](../templates/agent/passport-ux.md).

The design agent's job is to turn a brief into 2 to 3 Figma options that a named lock owner picks. That job covers mockups, brand boards and styleguides, tokens and component libraries, visual systems for internal tools, and naming and tone of voice. Naming and tone of voice follow the same rule: 2 to 3 options, and the lock owner picks. Brand capture from a public site is one of its tools. Every design request starts with [`design-brief`](../skills/design-brief/SKILL.md).

The UX agent's job is a heuristic and accessibility audit of a URL or flow, research synthesis, and information architecture with clickable wireframes. Journeys, flows, wireframes, and WCAG work stay with the UX agent. Wireframes follow [Wireframe projects](#wireframe-projects).

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
| IA package and wireframes | A dedicated throwaway wireframe or prototype repository. A cloud coding agent writes generated HTML or static wireframes there. Self-merge is allowed in that repository only. Never a product or client codebase. |
| Client-facing IA report | A new draft document for the asker. The client lead sends it. |

Do not edit a client's live library, live site, or live Figma file. Do not change a ticket's status. Do not send anything to a client. Do not publish a Figma library. Do not write code, open a code pull request, or merge. The one scoped exception is the UX agent's wireframe build: it may run a cloud coding agent to write generated HTML or static wireframes, only in a dedicated throwaway wireframe or prototype repository. It never touches a product or client codebase; that stays the code agent's. When separation matters, co-create through the code agent instead. In that throwaway repository the agent may self-merge, because it is a disposable prototype. Self-merge stays forbidden everywhere else, including this repository. Do not write secrets into files, Figma, or reports. Do not guess data: label it `EXAMPLE DATA` or flag it as unverified.

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
| Pick between IA or wireframe options, or accept a feedback round | lock owner named on the brief |
| Rename a client's service, product, or page label | that client's lead, after the client confirms |
| Self-merge in a dedicated throwaway wireframe repository | the agent (disposable prototype) |
| Merge in this repository, or in a product or client repository | a person. The agent never self-merges there |
| Send a wireframe link or IA report to a client | that client's lead |

## Wireframe projects

A wireframe project turns a brief into an IA package and a clickable greyscale wireframe. The playbook is [`wireframes`](../skills/wireframes/SKILL.md). These rules hold for every round:

- **Dedicated throwaway repository.** The UX role may run a cloud coding agent to write generated HTML or static wireframes only in a dedicated throwaway wireframe or prototype repository. That is a scoped exception to the no-code rule ([keep-human-gates](../principles/keep-human-gates.md) still holds everywhere else). It never touches a product or client codebase. When separation matters, co-create through the code agent instead. In that throwaway repository, self-merge by the agent is fine. Self-merge stays forbidden everywhere else, including this repository.
- **Full sources.** The cloud agent gets the full text of every source: structure documents, the client's material, transcripts, email threads, whiteboard exports with their images. A summary is not a source. The first rejected pass on a past project traced back to a brief that summarised its sources.
- **Sources register and decisions log.** `docs/00-sources.md` letters every source and states which one wins on which question. Each round of feedback is a new lettered source. `docs/06-decisions-log.md` numbers every decision (`D-<n>`) with its source and a fallback. Open items sit in one list.
- **Simple first.** Menus carry labels only. The explanation goes on the pages. Report the link and word count of each open menu. The mock has no banners, toggles, or notes on the canvas. Annotation lives in a sidebar.
- **Named units.** A small set of interaction types, one shape each. Buttons do actions, links go places, filters are not tags, a static box is not a card. Name every component in a library page. The sidebar inventory is generated from the page markup.
- **Search-friendly labels.** Prefer what a prospect would search for. Keep a coined client term with a plain line beneath it if the client wants it. A rename keeps the old term on the page, redirects the old slug, and waits for the client to confirm. Keyword volumes cite tool, region, and date. None are invented.
- **Visible content.** No accordions or tabs that hide content from crawlers. Filters change what is shown, not what is in the HTML.
- **Mobile and access from the first pass.** A mobile menu, keyboard use, focus order, and real buttons, checked in a headless browser.
- **Volatile names in one constant**, with a redirect and a build guard against leaks.
- **Client input.** A client's confirmed layout decides page layout. Locked IA decisions win over a new sketch, and the clash is logged. Undecided client ideas are open items, not changes. A sketch is not a cut list.
- **One generated build.** Pages, the component library, and the sidebar come from one build script. No hand-edited output. The build fails on a broken link, an unknown component, or a banned word.
- **Preview in the throwaway repository.** Review happens on the branch preview. Self-merge is allowed there only. A preview-only branch in any other repository is labelled do not merge.
- **One fresh eye.** An independent review uses one or two reviewers with one rubric, then one synthesis. On a past project, six parallel reviewers on one question opened six near-duplicate pull requests, and five closed unmerged.
- **Branded pass is the design agent's.** Skinning wireframes with a brand is a preview branch at most, owned by the design agent, and lists the brand gaps it found (contrast, type scale, states) for the lock owner.

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

Design reads Figma, Google Drive, Slack (read), GitHub (read), and Jira (handoff tickets). UX reads Figma, FigJam, Jira, Google Drive, meeting transcripts, Slack (read), email threads the asker points to (read), GitHub (read), whiteboard exports the asker supplies, and keyword or search data (read). Keyword figures cite their source (tool, region, and date). None are invented. UX writes generated HTML only through a cloud coding agent, in the dedicated throwaway wireframe repository the brief names.

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
| UX agent | [`wireframes`](../skills/wireframes/SKILL.md) | IA package and clickable greyscale wireframe in a dedicated throwaway repository. Self-merge allowed there only |
