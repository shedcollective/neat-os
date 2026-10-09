---
name: assurance
description: Assure a full pull request on a product repo that consumes neat-os. Post one living evidence pack. Each section result is a traffic light. Do not implement, push, approve, or merge.
---

# assurance

Assure one full pull request on a product repo that consumes neat-os. This playbook is the brief a Cloud Agent runs when an Assurance listener wakes. It reads the diff against the ticket and posts one evidence pack. It does not build the change.

This is **not** a launch playbook or a build playbook. Do not run it from `init`, `gather`, or `learn`. Do not resume the build agent's thread, branch, or plan. Locate it the same way as the launch playbooks (`resolve-consume.sh` / `require('@shedcollective/neat-os').skillsDir`). **Do not** search the public web for neat-os. **Do not** copy it into `.agents/skills/`.

An assurance listener (path B) wakes a Cloud Agent, which follows this file. A later scale-out (path A) is a GitHub Actions workflow that sets a pending check and starts the same Cloud Agent. Path A is not built, and the pilot does not require it. When Actions has credits and a preview URL exists, the same pack sections can carry richer evidence: an accessibility scan in CI on Accessibility, a bundle-size budget on Performance, and visual regression plus a load or smoke check against the preview on Blast radius / regression. This playbook does not add that workflow, those checks, or that listener.

## When to use

Independent assurance of a full pull request on a product repo that consumes neat-os. An assurance listener starts it (a GitHub listener, then a Cloud Agent). The author and the build agent do not.

If the pull request is still a draft, stop and say so. Do not post a pack, and do not mark the pull request ready. That is the listener's job.

## Steps

Before any row is a blocker because of how a language behaves, verify the claim by running it (`php -r`, `node -e`) or by citing the language manual. In PHP, `$x->prop ?? $fallback` and `$x?->prop` do not throw on null; a method call on null does.

Steps 2 to 9 name the judgement: `pass`, `nit`, or `blocker`. Step 10 maps that judgement to the Result light.

1. **Identify the pull request and the ticket.** Record the URL, the head SHA, the title, the body, and the author's login. Find the linked ticket (a Jira key, a GitHub issue, or both). No linked ticket is a blocker in the pack. Do not invent a key. If the pull request is still a draft, stop as [When to use](#when-to-use) says. When the author is a person, add `Author: @<login>` to the pack's Run line. When an automated agent opened the pull request, leave that tag out. Who else receives the results is the listener's routing, configured outside this repository, in the assurance agent's own config.

2. **Check acceptance against the diff.** Read the diff and the ticket's acceptance criteria, including every line that starts "Done when". Judge each claim from the diff. The author's summary is not evidence on its own.

3. **Read conventions and the passport.** From the resolved neat-os tree, read `conventions/`. In the product repo, read `AGENTS.md` and `.agents/` when they exist (the passport). Note each convention break. If the passport is missing, say so in the row. Absence is not a pass. A missing passport with no broken convention is a `nit`. A convention the diff breaks is a `blocker`.

4. **Assess tests and CI.** Read the test and CI evidence in the pull request: the diff, the body, and the checks. A claim with no command, result, or test change is not a pass. Use `nit` when the gap is optional. Use `blocker` when a done-when line depends on a check that has no evidence. Name what was not verified. Do not ask for a new product QA script.

5. **Name unstated risk.** Fill the row for risk the ticket never named. The row is required. Write that none was found only after you looked, and say what you looked at. Use `blocker` when that risk can ship a break, otherwise `nit` or `pass`.

6. **Flag security and privacy smells.** Read the diff for a credential or token, personal data in logs or fixtures, auth or permission widened without the ticket, or a new public route. Flag the smell in the pack. A smell that can ship is a `blocker`. Do not pentest, exploit, or probe a live system.

7. **Review accessibility in the diff.** Look only at UI the diff touches: keyboard and focus traps, contrast and semantics, form labels, and ARIA where the diff adds or changes it. If the diff has no HTML, CSS, or JS UI, mark `pass` and say so. If it does and you cannot fully judge from the diff, mark `nit` and write `needs scan/manual`. Mark `blocker` only for a break you can see in the diff. Do not ask for design polish or a full audit.

8. **Review performance in the diff.** Flag an obvious regression only: a large new asset, synchronous work on a critical path, an N+1 query, an unbounded list. If the change is render-heavy or network-heavy and the diff cannot show the cost, mark `nit` and write `needs measure`. Mark `blocker` only for a regression the diff already shows. Do not ask for a benchmark suite.

9. **Name blast radius.** Say what else this pull request can break. Look for shared templates, cache, CDN or edge cache, CMS publish, and shared components. Mark `pass` when the diff puts no shared surface at risk. Mark `nit` for a shared surface to watch. Mark `blocker` when the diff can break a shared surface the ticket does not address.

10. **Post or replace one pack.** Use the GitHub tool the runner already has. Do not install one. Find a comment on this pull request whose body starts with `## Assurance evidence pack`. Edit that comment so it is the only pack. If none exists, post one. If you cannot edit the existing comment, stop and say so, and do not post a second pack. Do not post a second pack, even one marked as superseding the first. The comment body is the template below, with placeholders filled. The first heading stays exactly `## Assurance evidence pack`.

**Write the pack in roughly 80% ASD-STE100 Simplified Technical English.** Use short sentences, active verbs, and simple words. The assurance agent applies this rule to the pack.

Open the pack with a TL;DR before the table. The TL;DR is the verdict light, then the blocker count and the nit count, then at most three one-line bullets. Name the blockers in those bullets first. The TL;DR light is `🟢` when the blocker count is 0. Nits may remain. The TL;DR light is `🔴` when the blocker count is greater than 0. Do not use `🟡` as the TL;DR light. A missing ticket is a blocker, so that light is `🔴`.

The Checked table columns are Result, Item, Notes, in that order. Each Result cell is only a traffic light. `🟢` means pass. `🟡` means nit. `🔴` means blocker. Do not write `pass`, `nit`, `blocker`, `fail`, or `uncertain` in a Result cell. When a row has more than one note, use the worst light: `🔴` when any note is a blocker, `🟡` when any note is a nit and none is a blocker, and `🟢` when every note is a pass. The blocker count is the number of `🔴` rows. The nit count is the number of `🟡` rows. The counts must match the rows. A nit inside a `🔴` row does not increase the nit count.

Each Notes cell is a bulleted list, one item per bullet. Join the bullets with `<br>` so the list renders in the cell. Mark every nit `**Nit:**`. When a step tells you to write `needs scan/manual` or `needs measure`, put that text in a `**Nit:**` bullet and set the Result to `🟡`. Keep the divider row under the header. A table with no divider row does not render.

Residual risk is a bulleted list. For Internal QA, write a short numbered list of checks. Name each blocker in that list. A person replies **Internal QA: fail** only when there is a blocker.

```
## Assurance evidence pack
Run: <agent url> · Head: <sha> · Ticket: <key> [· Author: @<login>]

### TL;DR
<🟢 or 🔴>
Blockers: n · Nits: n
- <one line>
- <one line>
- <one line>

### Checked
| Result | Item | Notes |
| --- | --- | --- |
| <🟢, 🟡, or 🔴> | AC / done-when vs diff | - <note><br>- **Nit:** <note> |
| <🟢, 🟡, or 🔴> | Conventions / passport | - <note> |
| <🟢, 🟡, or 🔴> | Tests / CI | - <note> |
| <🟢, 🟡, or 🔴> | Unstated risk (ticket never named) | - <note> |
| <🟢, 🟡, or 🔴> | Security / privacy smells | - <note> |
| <🟢, 🟡, or 🔴> | Accessibility | - <note> |
| <🟢, 🟡, or 🔴> | Performance | - <note> |
| <🟢, 🟡, or 🔴> | Blast radius / regression | - <note> |

### Residual risk
- <risk>
- <risk>

### For Internal QA
1. <check>
2. <check>
3. Reply **Internal QA: pass** (or **fail** and why) on this comment before merge.
```

The Run line is the URL of this Cloud Agent run, the head SHA you assured, and the ticket key or URL. If the run URL is unknown, write that it is unknown. Do not invent it. The bracketed author tag is present only when step 1 adds it.

The example below shows a complete pack. Do not post it. Use placeholders only.

```
## Assurance evidence pack
Run: https://example.com/agent · Head: <sha> · Ticket: ACME-123 · Author: @<login>

### TL;DR
🔴
Blockers: 1 · Nits: 2
- The diff does not meet one done-when line.
- The body does not show a test command.
- The passport for <project> is missing.

### Checked
| Result | Item | Notes |
| --- | --- | --- |
| 🔴 | AC / done-when vs diff | - The diff does not meet done-when line 2 on ACME-123.<br>- The author summary is not evidence. |
| 🟡 | Conventions / passport | - **Nit:** <project> has no passport.<br>- The diff breaks no convention. |
| 🟡 | Tests / CI | - **Nit:** The body names no command and no result. |
| 🟢 | Unstated risk (ticket never named) | - No extra risk. The review read the diff and ACME-123. |
| 🟢 | Security / privacy smells | - The diff has no credential, token, or personal data. |
| 🟢 | Accessibility | - The diff has no HTML, CSS, or JS UI. |
| 🟢 | Performance | - The diff shows no large asset and no unbounded list. |
| 🟢 | Blast radius / regression | - The diff puts no shared surface at risk. |

### Residual risk
- A later edit can still break a shared template in <project>.
- The review did not open https://example.com.

### For Internal QA
1. Check done-when line 2 on ACME-123 against the diff.
2. Confirm the missing passport for <project>.
3. Reply **Internal QA: fail** on this comment and say why.
```

## Stop

The playbook is finished when that single comment is the only `## Assurance evidence pack` on the pull request, or when the pull request is still a draft and that has been reported.

Do not implement the feature. Do not push commits or force-push. Do not approve or merge the pull request. Do not resume the build agent's thread, branch, or plan. Do not put `🟢` in a Result cell when the diff shows a blocker, or when the row must say `needs scan/manual` or `needs measure`. Do not mark a draft pull request ready.

Do not turn assurance into a build. Do not ask for a full product QA script, design polish, or a rewrite. Do not require an accessibility scan in CI, a bundle-size budget, visual regression, or a load or smoke check against a preview. Those are path A, and only when Actions has credits and a preview exists. The pilot pack uses the section names above with evidence from the diff.

After the pack, stop. A person replies **Internal QA: pass** (or **fail** and why) on that comment before merge. **Internal QA: fail** is for blockers only. GitHub may still allow the merge button. The agent does not press it.
