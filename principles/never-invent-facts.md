# never-invent-facts

Client, product, stack and environment facts come from the repository tree or from a human. Unknowns are marked visibly; they are never guessed to make a document look finished.

**Applies when** filling any project slot (`AGENTS.md`, `.agents/project.md`, platform leaves), writing an overview, or when a scan yields a hint (a package `description`) that looks like an answer.

**The decision it changes.** What goes in the slot. It stays `to confirm` or **Awaiting interview**, with any hint labelled as a hint, and the run reports itself incomplete. A scan is not done. An interview finishes it. Company conventions are not re-asked, because they are facts already known.

**Source.** [`skills/gather/SKILL.md`](../skills/gather/SKILL.md) (the scan is not the finish; "Awaiting interview" stays until a person answers). Pull requests recorded in the archive repository changed `gather` so it stops writing scan hints as if they were project facts.
