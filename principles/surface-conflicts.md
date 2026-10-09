# surface-conflicts

When instructions conflict or a decision would materially change scope, stop and surface it. Do not guess, and do not block silently either.

**Applies when** two sources disagree (a skill and a convention, a ticket and the tree, a human answer and repo evidence); when a step would touch something outside the plan; when a smoke would only pass by weakening an assertion.

**The decision it changes.** What happens while the question is open. The agent finishes everything that does not depend on the answer, states the assumption it would make by default, and asks once in the place the humans are watching (the PR or tracking issue). Reversible work continues. Irreversible work waits.

**Source.** [`skills/gather/SKILL.md`](../skills/gather/SKILL.md) (a Cloud Agent with no answers leaves "Awaiting interview" and stops rather than guessing); [pstack](https://github.com/cursor/plugins/tree/main/pstack), which tells agents not to block on a person except before an irreversible action.
