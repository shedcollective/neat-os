<!-- Shape: conventions/writing.md#pull-request-bodies. A filled example is in that section. Delete unused prompts and this comment.
     A stacked step keeps the first line required by conventions/git.md.
     A pull request into develop includes the closing keyword from conventions/tickets.md.
     The body does not record branch state such as behind or conflicting. GitHub shows that, and it goes stale. -->

Replace this paragraph. Say what changes in practice, and why a reviewer should accept it. Do not list files.

<!-- Optional: a concrete before and after, only when it shows the change better than the opening. -->

<!-- Optional: the decision or trade-off, and the path to read. Delete this when the change is straightforward. -->

Verified: name what was run or inspected, the result, and what was not verified.

<details>
<summary>Reference</summary>

<!-- Include a line only when it has something to say. Do not repeat the opening. Do not hide a risk in here.
     Touched rules use an existing identifier: a principle slug, a convention path, an ADR id, or a policy id.
     The other lines are rationale, consumers, references, and deferred work. -->

</details>

## Review

- [ ] Confirm this change names no client, no client company, and no client project, and quotes no Slack thread or other internal discussion ([conventions/neutral-reference.md](https://github.com/shedcollective/neat-os/blob/develop/conventions/neutral-reference.md)).
- [ ] Confirm prose comments state current behaviour and its constraint, responsibility headers that this change makes false are updated, and a replaced design removes the superseded path and its outdated comments ([conventions/code-comments.md](../conventions/code-comments.md)).
