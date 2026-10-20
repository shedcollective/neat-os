# Improvement record

**Locked:** an improvement on a live product is recorded with a baseline taken before the change, the same measure taken after it, and a summary a client can read. The record is a file in the product repository under `.agents/improvements/`.

This page says what an improvement record holds. The `improve` playbook ([skills/improve/SKILL.md](../skills/improve/SKILL.md)) writes it. A person writing one by hand follows the same shape. Why the record lives in the repository and who approves the summary is recorded in [ADR-0021](../docs/decisions/0021-improvement-records-live-in-the-product-repo.md).

## What counts as an improvement

An improvement is a change to a live product whose value is a before-and-after difference: faster, more accessible, found more often, fewer errors, more conversions. A new capability or a bug fix is tracked by its ticket, not by a record, unless the ticket names a measure the change should move.

## Categories

Every record has one category. Pick it by the evidence that can be collected, not by the kind of work.

| Category | Evidence | Baseline and result | Examples |
| --- | --- | --- | --- |
| Measured | A tool scores the product before and after. | The tool's number both times: the same tool, settings, page, and device profile. | A Lighthouse or Core Web Vitals score, page weight, an automated accessibility scan, an SEO score, an error rate. |
| Counted | Granular fixes, each logged and checked by a person. | The count found before and the count remaining after. The log in the record body is the audit trail. | 300 contrast or tap-target fixes, broken links, content corrections. |
| Observed | Behaviour or analytics move after the change ships. | The metric over a window before release and the same metric over a window of the same length after. | User frustration signals, conversion or engagement, a UX change shipped as normal tickets and reviewed after release. |

If a tool scores it, the record is Measured. If a person checks each item, it is Counted. If only analytics can show it, it is Observed. When one piece of work needs two kinds of evidence, write two records.

## The record

One file per improvement at `.agents/improvements/<ticket>-<slug>.md`, with the ticket key in lowercase, the same way feature plans are named. The file starts with YAML frontmatter that carries the locked keys in this order, then a Markdown body.

| Key | Required | What it holds |
| --- | --- | --- |
| ticket | yes | The ticket key. |
| title | yes | One line in sentence case that names the product state, the same as the ticket title. |
| category | yes | `measured`, `counted`, or `observed`. |
| area | yes | The page, flow, or surface the improvement is about, as the client would name it. |
| measure | yes | What is measured and how: the tool and its settings, the page and device profile, or the metric and the window. The same for baseline and result. |
| baseline | yes | `value`, `date`, and `evidence` (a link or a repository path). Taken before the change. |
| result | once the change is live | `value`, `date`, and `evidence`. The same measure as the baseline. |
| summary | once the result is in | One or two sentences a client can read, with the numbers from baseline and result. |
| status | yes | `draft` or `approved`. The playbook writes `draft`. A person sets status to approved. |
| approved_by | when approved | The role, or the name the project uses for that person. |
| approved_on | when approved | The date. |

Extra keys may follow the locked ones. A reader skips keys it does not know. A later assessor records its outcome as extra keys; this page does not define them.

The body holds an `## Evidence` section in free text: how the measure was taken, what changed between the two readings that was not the improvement, and anything a reader needs to trust the numbers. A Counted record also holds a `## Log` section with one line per item: what was fixed, where, and that a person checked it.

## Baseline

The baseline is taken before any part of the change reaches the live product. A change that already shipped can still have a baseline when the measure can be taken against the previous version as it was deployed, or from analytics history before the release date, and the record says so under Evidence. A remembered, estimated, or back-calculated baseline is not a baseline. Without one there is no record, and the work is tracked by its ticket alone.

The result uses the same measure as the baseline. A different tool, a different page, or a different window is a new baseline, not a result.

## Summary

The summary is the line that goes on a project page or into a client report. It states what changed and by how much, with the numbers from the record, in the tone locked in [ticket-content.md](ticket-content.md#tone). It does not describe the code change, the agent, or the process. When the result is flat or worse, the summary says so. A record that shows no gain is still a record.

## Sign-off

A record stays `draft` until a person sets status to approved. That person is the role named under Improvements in the project's `.agents/project.md`, and the account owner for the project when that slot is empty. The summary leaves the repository (a project page, a client report, a roll-up) only when the status is `approved`. An agent never sets it.

## Examples

Three synthetic records, one per category. Values and links are placeholders.

A Measured record, after the result is in:

```yaml
---
ticket: ACME-123
title: Catalogue page loads faster on mobile
category: measured
area: Catalogue page, mobile
measure: Lighthouse 12 Performance score, mobile preset, https://example.com/catalogue, median of three runs
baseline:
  value: 54
  date: 2026-10-01
  evidence: .agents/improvements/acme-123-baseline.json
result:
  value: 89
  date: 2026-10-15
  evidence: .agents/improvements/acme-123-result.json
summary: The catalogue page on mobile now scores 89 for performance, up from 54, after images were resized and the product list loads on scroll.
status: draft
---

## Evidence

Both readings were taken on the live site with the same Lighthouse version and preset. No other change reached the catalogue page between the two dates.
```

A Counted record:

```yaml
---
ticket: ACME-124
title: Text on the help pages meets the contrast standard
category: counted
area: Help centre pages
measure: Contrast failures against WCAG 2.2 AA reported by the automated scan, checked one by one by a person
baseline:
  value: 300
  date: 2026-10-02
  evidence: https://example.com/scan/before
result:
  value: 0
  date: 2026-10-16
  evidence: https://example.com/scan/after
summary: All 300 contrast failures on the help centre pages have been fixed and each fix was checked by hand.
status: draft
---

## Evidence

The scan ran on every help centre page. The second scan used the same page list.

## Log

- Body text on the article template, colour token updated, checked.
- Link text in the sidebar, colour token updated, checked.
```

An Observed record, written before the result window has closed:

```yaml
---
ticket: ACME-125
title: More visitors complete the enquiry form
category: observed
area: Enquiry form
measure: Enquiry form completion rate from the analytics tool, four full weeks before release and four full weeks after
baseline:
  value: 2.1%
  date: 2026-09-29
  evidence: https://example.com/analytics/enquiry-before
status: draft
---

## Evidence

The baseline window is 1 to 28 September. The result window closes four weeks after the release date.
```

## Project vs company

| Fact | Where |
| --- | --- |
| The categories, the keys and their order, the baseline rule, the sign-off rule | Here |
| Who approves a summary, which measuring tools and analytics the project uses | Project `.agents/project.md` under Improvements. `gather` asks; the `improve` playbook reads. |
| The records themselves | Project `.agents/improvements/` |

## Source

[ADR-0021](../docs/decisions/0021-improvement-records-live-in-the-product-repo.md).
