---
name: improve
description: Record an improvement on a live product so it can be reported. Take a baseline before the change, the same measure after, and write one record under `.agents/improvements/` in the shape locked by conventions/improvement-record.md, with a summary a client can read. Writes the record as draft; a person approves it. Not init, gather, learn or ticket.
---

# improve

Turn improvement work on a live product into a result that can be reported. Every improvement gets a baseline before the change, the same measure after it, a category by the kind of evidence, and one record in a stable shape, so a project page, a client report, or a roll-up can read it later.

The categories, the record keys, the baseline rule, and the sign-off rule are locked in [conventions/improvement-record.md](../../conventions/improvement-record.md). Read that page first, every run. This playbook only orders the steps.

This is **not** a launch playbook. Do not run it from `init`, `gather`, or `learn`. Locate it the same way as those playbooks (`resolve-consume.sh` or `require('@shedcollective/neat-os').resolveConsume()`): `NEAT_OS_ROOT`, then `node_modules/@shedcollective/neat-os`, then `vendor/shedcollective/neat-os`, then sibling `../neat-os`. `SHED_OS_ROOT` and the shed-os package paths still resolve and are deprecated (`docs/consume.md`). **Do not** search the public web for neat-os. **Do not** copy it into `.agents/skills/`.

## Hard rules

- **Baseline before change.** No part of the change reaches the live product before the baseline is taken and written into the record. A baseline that is remembered, estimated, or worked back from the result is not a baseline. If none can be taken, stop and say so; the work is tracked by its ticket alone.
- **Same measure after.** The result uses the tool, settings, page, device profile, or metric and window that the record's `measure` names. A different one is a new baseline, not a result.
- **One category per record.** `measured`, `counted`, or `observed`, chosen by the evidence that can be collected. Work that needs two kinds of evidence gets two records.
- **Never invent a number.** Every value in the record comes from a tool run, a log a person checked, or an analytics report, and `evidence` points at it. When a value is unknown, the key stays out and the report names it.
- **Draft only, internal only.** The playbook writes `status: draft` and `audience: internal`. A person sets status to approved and raises the audience. The summary does not leave the repository (a project page, a client report, a roll-up) until then. Do not post the summary anywhere.
- **The record is the only thing this playbook writes.** It does not create the ticket (that is `ticket`), does not decide how to build the change, and does not fill project facts (that is `gather`).
- **The client reads the summary.** Numbers from the record, the client's names for things, no code change, no agent process. Tone per [conventions/ticket-content.md](../../conventions/ticket-content.md#tone).

## When to use

- A ticket asks to make a live product faster, more accessible, found more often, less error-prone, or better at converting, and the gain should be reported.
- A batch of granular fixes (contrast, tap targets, broken links, content corrections) is about to start and the count should be on record.
- A UX change is shipping as normal tickets and someone wants the effect reviewed after release.

## When not to use

- A new capability or a bug fix whose ticket names no measure to move. The ticket and its acceptance criteria are the record.
- The change already shipped and no baseline can be taken against the previous deployed version or from analytics history. Say so and stop.
- Writing the ticket, the feature plan, or the pull request for the change. Other playbooks and the normal workflow do that.

## Inputs

| Input | Where it comes from |
| --- | --- |
| Ticket key | The ticket the improvement belongs to. If there is none, stop and ask for one, or run `ticket` first. The record is named after it. |
| Category | Chosen in step 2 from the evidence available. The person may name it; check it against the convention's table. |
| Measure | The person, the ticket, or the Improvements slot in `.agents/project.md` (measuring tools, analytics source). |
| Approver | `.agents/project.md` under Improvements. When empty, the account owner for the project. Do not invent a name. |
| Existing record | `.agents/improvements/<ticket>-<slug>.md` when the baseline was taken in an earlier run. |

## Steps

1. **Confirm the repository and locate neat-os.** `git rev-parse --show-toplevel`. Resolve neat-os with the locked order. Read `conventions/improvement-record.md` from that tree. Read `.agents/project.md` under Improvements for the approver, the measuring tools, and the analytics source. If `.agents/improvements/` is missing, create it with the README from `templates/.agents/improvements/` in the resolved tree. Do not run `init` or `gather` as a side effect.

2. **Pick the mode and the category.** If a record for the ticket already exists and holds a baseline, the mode is `result`: skip to step 5. Otherwise the mode is `baseline`. Choose the category from the convention's table: a tool scores it (`measured`), a person checks each item (`counted`), only analytics can show it (`observed`). State the choice and why in one line. If the work needs two kinds of evidence, say so and write two records.

3. **Define the measure and take the baseline.** Write `measure` so another person could repeat it: the tool and version, its preset, the page and device profile, the run count, or the metric and the window. Write `unit` (what the number is) and `better` (`higher` or `lower`). Then take the reading on the live product before any part of the change reaches it. The value is a number in that unit, not a string with the unit inside it.
   - `measured`: run the tool. Keep the report. Store it as a file beside the record when it is text and small, otherwise attach it to the ticket and link it.
   - `counted`: run the scan or audit that finds the items, and write the count found. Start the `## Log` section with one line per item as a person checks it.
   - `observed`: read the metric from the analytics source over a full window that ends before the release date. Name the window in `measure`.
   If the change has already shipped, take the baseline against the previous version as it was deployed, or from analytics history before release, and say under Evidence how it was taken. If neither is possible, stop as [Hard rules](#hard-rules) say.

4. **Write the record as draft.** Create `.agents/improvements/<ticket>-<slug>.md` with the locked keys in order, `audience: internal`, `baseline` filled, `result` and `summary` left out, and `status: draft`. Fill `## Evidence` with how the baseline was taken. Commit it in the branch the change will ship from, so the record and the change travel in the same pull request. When the change ships in several pull requests, the record goes in the first. Report that the baseline is in and stop until the change is live.

5. **Take the result.** When the change is live, take the same measure again. For `observed`, wait until the result window has closed; a partial window is not a result. For `counted`, the result is the count remaining after a person checked each item, and the `## Log` is complete. Fill `result` with the value, the date, and the evidence. Add to `## Evidence` anything else that changed between the two readings and was not the improvement.

6. **Write the summary.** One or two sentences a client can read, with the baseline and result numbers, in the tone the convention names. State a flat or worse result as plainly as a gain. Check it against the convention before showing it: no code change, no agent process, no filler words, the client's names for things.

7. **Link the record from the ticket.** With the ticket tool the runner already has, add the record's repository path under Links on the ticket. Change nothing else on the ticket. If no ticket tool is available, say so in the report and leave the link to the person.

8. **Report and stop.** Print the record path, the category, the measure, the baseline and result values, the summary, and the approver role from the Improvements slot (or "account owner" when the slot is empty). State that the record is `draft` with `audience: internal`, and that the summary does not leave the repository until that person sets status to approved and raises the audience. Do not set either. Do not post the summary anywhere.

## Stop

The playbook is complete when the record exists in the product repository with the locked keys, a baseline taken before the change, a result taken with the same measure, a summary, and `status: draft`, and is in the branch that ships the change. A `baseline` run is complete at step 4 with the result and summary left out. It is not complete if a value was estimated, if the result used a different measure from the baseline, if the summary describes the code or the process, if the summary was posted outside the repository, or if the agent set status to approved or raised the audience.
