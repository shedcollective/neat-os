# Ticket content

**Locked:** a ticket an agent writes describes a problem and the outcome the client wants. It does not describe how a developer will build it.

This page says what goes in a ticket. Where a ticket lives (Jira or GitHub Issues) is in [tickets.md](tickets.md). The `ticket` playbook ([skills/ticket/SKILL.md](../skills/ticket/SKILL.md)) applies this page when it creates or enhances a ticket. A person writing a ticket by hand follows the same shape.

The client can read every ticket in Jira. Write each one as if the client will read it today, because they will.

## Decided outcome

These three rules apply to every ticket, including one that is being enhanced.

- A ticket must make sense in isolation and record only the final decided outcome, stated as fact.
- It must not contain the original request text, meeting discussion, options considered, attributions, or a partial history of how the decision was reached.
- When a decision changes, rewrite the ticket body to the new decision instead of appending history.

## Type and workflow

- Jira issue type is **Task**. This OS does not use Story, Bug, Epic or Sub-task as issue types. A bug is a Task with the "How to replicate" section filled.
- A new ticket stays in the first column of the project's workflow (usually "Reported"). The agent does not move it, and a person triages it later.
- No estimate, no story points, no due date. Estimates are agreed with the client by a person.
- Priority stays at the project default. A person sets it during triage.
- Assignee stays empty unless the person asking for the ticket named someone.

## Sections

The description carries these sections as headings, in this order. A section with nothing to say is left out rather than filled with "N/A", except the ones marked required. A required section that nobody could fill is left out too, and the gap is named under More information needed (see [When the request is unclear](#when-the-request-is-unclear)). It is never filled with a guess or a placeholder.

| Section | Required | What it holds |
| --- | --- | --- |
| Title | yes | One line, under 70 characters, sentence case, no ticket key, no trailing full stop. A new capability names the outcome. A breakage names what is wrong now. When the class is not yet clear, the title names the problem as reported. See [Title](#title). |
| More information needed | when the request is unclear | What the ticket still needs before a developer can start. One question per line, each addressed by role to the person who can answer it (the client contact or the reporter). Present only when a required section could not be filled after asking. |
| Why | yes | The problem or opportunity, and who it affects. One or two short paragraphs. |
| What | yes | The outcome the client should see when the ticket is done. Describe behaviour a user or client would notice. Do not describe the code change. |
| How to replicate | bugs only | Numbered steps from a known starting point, what happens, and what should happen instead. Include the environment (production, UAT, local) and the browser or device when known. |
| Out of scope | when useful | What a reader might assume is included and is not. One bullet each. |
| Acceptance criteria | yes | A checklist. Each line starts "Done when" and can be checked by someone who is not a developer. See below. |
| Links | when useful | Related tickets, designs, documents, and pages or paths in the repository that show where the behaviour lives today. A link is a pointer for the developer, not an instruction. |
| Attachments | when useful | Screenshots, recordings, exports. Name each one in the description so a reader knows what to open. |

## Title

The title is one sentence about a product state a client would say. The verb tells a board scan whether something is already broken.

**New capability.** Name the outcome, as a positive ability. This is the line that can be reused as a `feat` description and a branch slug. Do not start it with "Ensure".

- Customers can download invoices as PDF
- Users can update their profile

**Breakage (fix or bug).** Something that should already be true is not. The title shows that, so urgency is in the words and not only in the priority field. Two shapes are valid:

- The failure, present tense: "Production is not backing up", "Customers cannot download past invoices"
- The unmet obligation: "Ensure backups are landing on production", "Ensure customers can download past invoices"

"Ensure" is only for a breakage title. It is allowed there even though the [tone](#tone) list bans `ensure` in the description. Use the negative when the failure itself is the urgent fact. Use "Ensure" when the missing result is clearer than a negative.

A breakage title that is a bare positive reads as already done. "Production server has backups" and "Customers can download past invoices again" fail that test.

The What section holds the outcome for both classes. When the class is not yet clear, the title names the problem as reported.

## Acceptance criteria

Acceptance criteria are how the client and the developer agree the ticket is finished. Each criterion is one line, starts with "Done when", names one observable result, and can be checked without reading code.

Good: "Done when a customer on the order history page can download any past invoice as a PDF."

Not acceptable: "Done when the PDF service is refactored" (describes work), "Done when it works" (not checkable), "Done when the invoice endpoint returns 200" (needs a developer to check).

A project can add standing criteria that every ticket carries, such as "Done when the change is on UAT and the client has signed it off". Those live in the project's `.agents/project.md` under Tickets, and the playbook appends them.

## When the request is unclear

Some requests arrive as one line, a forwarded screenshot, or a sentence in a meeting. The person writing the ticket cannot always find out who is affected, what should happen instead, or how to check it is done. The ticket still goes in. A ticket that names its gaps is worth more than a brief lost in a chat, and the first column of the workflow is where a person triages it and chases the answers.

- Ask first. When the person who made the request is present, ask the missing questions once, in one batch, before writing the ticket. Only what they cannot answer goes into the ticket as a question.
- Fill what is known, leave out what is not. Why, What and Acceptance criteria are filled as far as the request supports. A section with nothing solid behind it is left out and its gap becomes a question. Half a section is fine; a guessed one is not.
- Add a More information needed section first in the description, before Why. One question per line. Each question names who can answer it by role: the client contact, the reporter, the support person who forwarded the email. Questions are ones that person can answer without technical knowledge ("Which browsers have you seen this in?", not "Does the request reach the API?").
- Do not ask the developer in that section. If the only open questions are technical ones, the ticket is clear enough; the developer will find out.
- Acceptance criteria stay honest. Write only the criteria the known facts support. If none do, leave the section out and ask for the expected outcome under More information needed. Do not write "Done when the client is happy".
- Nothing in More information needed is a placeholder inside another section. Every other section reads as finished text.

When the answers arrive, someone runs the `ticket` playbook in enhance mode, moves each answer into its section, and removes the question. The section disappears when it is empty.

## What a ticket never contains

- Technical design: which files, classes, libraries or database changes. The developer who picks the ticket up decides that. Repository paths are allowed only in Links, as a pointer to where the behaviour lives today.
- Agent process: "I searched the codebase", "as an AI", "based on my analysis", a summary of the conversation that produced the ticket.
- Anything the client should not see: internal cost, margin, other clients, staff opinions, credentials, private URLs.
- Placeholders. If a section is unknown after asking, it is left out and the gap is a named question under More information needed. A ticket with "TBC" or "to confirm" inside a section is not created.
- Emoji, decorative symbols, or formatting for its own sake.

## Tone

The client reads the ticket, so it reads like a note from a colleague who knows the product. The rules in [writing.md](writing.md) apply, and these matter most in a ticket:

- Write in British English.
- Keep sentences short and in the active voice. Say who does what.
- Use the client's names for things. If the client calls the staging site "UAT", the ticket says UAT. The project's vocabulary is in `.agents/project.md` under Tickets.
- Prefer the plain word: "fix", "add", "show", "remove". Do not write `leverage`, `robust`, `seamless`, `streamline`, `enhance the user experience`, `ensure`, `utilise`, `comprehensive`, `delve`. The ban on `ensure` is for the description. A breakage title may start with Ensure (see [Title](#title)).
- Do not open with a summary of what the ticket is about; the title did that. Do not close with an offer to help or a next-steps paragraph.
- Do not stack three adjectives, three synonyms, or three bullet points where one would do.
- No bold inside the description except a single warning a reader must not miss. No headings other than the section names.

A useful test: read the ticket aloud. If a project manager would not say it that way in a call with the client, rewrite it.

## Formatting for the ticket system

Section names are headings in whatever the ticket system renders. GitHub Issues take Markdown (`## Why`). Jira Cloud renders its own document format, and pasting Markdown into it leaves literal `##` on the page. Write the description in the format the ticket tool accepts (Jira wiki markup `h3. Why`, or the tool's own rich-text input), and check the created ticket renders headings and the checklist before reporting done.

Attachments are uploaded when the tool can upload. When it cannot, the Attachments section names each file and the person attaches it after creation. Do not leave an Attachments section that names nothing.

## Example

A bug reported by email, written up as a ticket. The email is context for the writer. The ticket states the decided outcome.

```text
Title: Customers cannot download past invoices

Why
Customers who need an invoice for their accounts cannot get one without
emailing support. Support has had six of these since Tuesday.

What
On the order history page, the Download invoice button gives the customer
the PDF for that order, on the live site, for every past order.

How to replicate
1. Log in to the live site as a customer with at least one past order.
2. Open Account, then Orders.
3. Click Download invoice on any order.
What happens: the button shows a spinner and nothing downloads.
What should happen: the invoice PDF downloads.
Seen in Chrome and Safari on desktop.

Out of scope
- Changing the invoice layout.
- Invoices for orders placed before the site moved in 2024.

Acceptance criteria
- Done when a customer on the live site can download the invoice for any
  past order from the orders page.
- Done when the support inbox has had no new "cannot download invoice"
  reports for five working days after release.
- Done when the change is on UAT and the client contact has signed it off.

Links
- Orders page on the live site: https://example.com/account/orders
- Where the button lives today: templates/account/orders.twig

Attachments
- spinner.mov, a screen recording of the spinner on the orders page.
```

The same ticket before enhancement had the title "Invoice bug" and a pasted email as the whole description. Enhancing it rewrote the body to the decided outcome above and gave the ticket a title that names the breakage. The email text is not in the ticket. Nothing was set on type, status, priority or assignee.

The same request when it arrived as one line in a meeting, with nobody there to answer questions. The ticket goes in and says what it needs:

```text
Title: Invoice download failing for some customers

More information needed
- Client contact: which page were the customers on, and what did they see
  when the download failed?
- Client contact: roughly how many customers, and since when?
- Client contact: do you know which browser or device any of them used?
- Reporter: were any screenshots or emails from the customers shared?

Why
Customers who need an invoice for their accounts cannot get one.

What
Customers can download the invoice for any past order.

Acceptance criteria
- Done when the change is on UAT and the client contact has signed it off.
```

How to replicate is left out because nobody knows the steps yet; the questions that would fill it sit under More information needed. The one acceptance criterion is the project's standing one; a criterion about the fix itself waits for the client contact's answers.

## Enhancing an existing ticket

Enhancing means bringing a ticket up to this shape as the current decided outcome.

- Read the existing description and the comments for context. Do not edit or delete comments. Do not copy the request, the discussion, the options, or an earlier draft into the body.
- Rewrite the body to the final decided outcome, stated as fact. When the decision has changed, replace the body with the new decision. The body holds that decision alone.
- A ticket that already has the sections is rewritten in place to that outcome. Missing sections are added. Present sections are tidied so they state the outcome as fact.
- A section that cannot be filled from the ticket, its comments, or the person asking becomes a question under More information needed, addressed by role to the ticket's reporter or the client contact. When the answers to an existing More information needed section are in the comments or the request, they move into their sections as fact and the answered question goes.
- The title is rewritten when the decided outcome changes, and when a breakage title reads as already done. A feature title that already names the current outcome is left as it is.
- Type, status, priority, assignee, estimate, labels and components are not changed.
- The agent does not add a comment announcing the edit unless the person asked for one.

## Project vs company

| Fact | Where |
| --- | --- |
| The section list, the acceptance criteria shape, the tone rules | Here |
| Task is the only Jira issue type | Here |
| Jira project key | Project `.agents/project.md` (ticket prefix, written by `gather`) |
| Jira site URL, default labels or components, client vocabulary, standing acceptance criteria | Project `.agents/project.md` under Tickets. `gather` asks; the `ticket` playbook reads. |

## Source

[ADR-0012](../docs/decisions/0012-ticket-playbook-writes-jira-not-the-repo.md). [ADR-0015](../docs/decisions/0015-ticket-titles-name-a-capability-or-a-breakage.md) locks that a new-capability title names the outcome and a breakage title names what is wrong now. [ADR-0020](../docs/decisions/0020-ticket-records-the-decided-outcome.md) locks that the body is only the decided outcome. The tone rules restate the part of [writing.md](writing.md) that matters when a client is the reader.
