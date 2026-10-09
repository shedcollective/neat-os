# smallest-complete-change

Prefer the smallest change that fully solves the problem. No speculative abstraction, no unrelated refactor, no file because it sounds advanced.

**Applies when** planning any change, and again before opening the PR: does every file in the diff solve a demonstrated problem, improve a measurable outcome, or protect a real boundary?

**The decision it changes.** What gets left out. Drop the helper nobody calls yet, the second config option, the rename that "tidies" a neighbour. Completeness is still required: the change must include its tests, docs and evidence.

**Source.** the closing rule of [schema/README.md](../schema/README.md) ("when in doubt, delete"; no file exists because it sounds advanced); [pstack](https://github.com/cursor/plugins/tree/main/pstack) states the same rule.
