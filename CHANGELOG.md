# Changelog

## Unreleased

`improve` is a playbook for a product repository. It turns an improvement on a live product into a result that can be reported: a baseline taken before the change, the same measure taken after, a category by the kind of evidence (Measured, Counted, Observed), and a summary a client can read. The record is one file under `.agents/improvements/` in the shape locked by [conventions/improvement-record.md](conventions/improvement-record.md); `init` scaffolds that folder and `.agents/project.md` gains an Improvements slot for the approver and the measuring tools. Values are numbers with a unit and a direction, so a roll-up such as the stats page in #7 can read them. The playbook writes the record as draft for an internal audience. A person sets it to approved and raises the audience before the summary is shared ([ADR-0021](docs/decisions/0021-improvement-records-live-in-the-product-repo.md)). Issue #6.

`meeting-prep` is an agency operations playbook with two modes. `brief` prepares one person for the day's external or tagged meetings, reading the private operations record when one is set. `proposals` drafts numbered ticket proposals from the transcript afterwards, reading the same sources as `brief` and the open tickets. Any person's agent can propose by default (`<proposer>` is `any`). Before proposing and before applying, the run searches the tracker for a matching ticket created since the meeting and checks a shared processed marker when the operations record has one, so a proposal is never applied twice. Each proposal can be approved, changed, held until a named condition, or dropped. Nothing is applied until the person approves it. A meeting the person names skips qualification, the log path is optional, and the run finds the client's tracker project from the operations record or the product repository. Shared settings come from [conventions/routine-settings.md](conventions/routine-settings.md). The map is [docs/agency-ops.md](docs/agency-ops.md).

`publish-npm` and `release-smoke` fail when the release tag is not reachable from `main`. Prepare release opens the pull request into `main` and a draft Release. A person merges with a merge commit, then publishes the draft, which creates the tag at the tip of `main`. The steps are in [docs/release.md](docs/release.md).

`daily-digest` is an agency operations playbook. It distils the day file into a short end-of-day post and delivers it to the routine's destination. Agency operations playbooks now name their inputs with the settings in [conventions/routine-settings.md](conventions/routine-settings.md), and [templates/ops/bot-skill.md](templates/ops/bot-skill.md) is the thin wrapper a person's agent uses to run one. The map is [docs/agency-ops.md](docs/agency-ops.md).

A ticket records only the final decided outcome, stated as fact ([conventions/ticket-content.md](conventions/ticket-content.md), [ADR-0020](docs/decisions/0020-ticket-records-the-decided-outcome.md)). The body does not keep the request, the discussion, or a history of how the decision was reached. When a decision changes, the ticket body is rewritten.

## 0.5.0

This repository does not store secrets, credentials, or project-specific information. The convention is [never-store-secrets](conventions/never-store-secrets.md). A secret goes in an environment variable or another store outside the repository. A fact about one product repository goes in that repository's own docs.

The principle set has no numeric cap ([ADR-0018](docs/decisions/0018-no-numeric-principle-cap.md)). Keep the set small. Delete a principle that stops changing behaviour. The elevation bar enforces that rule.

Agency operations playbooks are `daily-burndown`, `enhance-daily-update`, `project-update`, and `client-brief`. What a shared work digest may contain is [agent-work-logging](conventions/agent-work-logging.md). The map is [docs/agency-ops.md](docs/agency-ops.md). The day body is one shared record: Agency state first, then one section per project. Pull requests #9, #11, and #13.

`.github/workflows/publish-npm.yml` publishes `@shedcollective/neat-os` to GitHub Packages when a Release is published. A product repository may install that package. The `.npmrc` and the `read:packages` token are in [docs/consume.md](docs/consume.md). Agents and Cloud Agents keep the git pin, because an agent token gets a 403 from the registry. [ADR-0019](docs/decisions/0019-publish-github-packages.md) partially supersedes the paused publishing in [ADR-0017](docs/decisions/0017-consume-via-github-packages.md). Pull request #14.

## 0.4.0

The product name is neat-os. The Node package is `@shedcollective/neat-os`. The Composer package is `shedcollective/neat-os`. Install with a git pin, `github:shedcollective/neat-os#vX.Y.Z`. Releases are tagged on `shedcollective/neat-os`.

A repository that already pins shed-os replaces that pin and the Composer package name, and renames `SHED_OS_ROOT` to `NEAT_OS_ROOT`. The same rename applies to `SHED_OS_TICKET_PREFIX` and `SHED_OS_JIRA_PREFIX`. The steps are in [docs/consume.md](docs/consume.md#moving-from-shed-os).

The resolver still reads each old environment variable when the new name is unset. It still finds a sibling `../shed-os`, `node_modules/@shedcollective/shed-os`, and `vendor/shedcollective/shed-os`. Those hits print a deprecation warning. The PHP class is `Neat\Os\NeatOs`.

Publishing to GitHub Packages stays paused. The install documented for product repositories is the git pin. [ADR-0017](docs/decisions/0017-consume-via-github-packages.md) keeps the intent to publish later.

The README carries the lockup, the how-it-fits diagram, and five concept diagrams.

The guide names six playbooks: `init`, `gather`, `learn`, `ticket`, `assurance`, and `pin-majors-with-reasons`.

## Earlier versions

Releases before 0.4.0 were published as shed-os. Those notes stay in the git history and the ADRs. This file does not restate them.
