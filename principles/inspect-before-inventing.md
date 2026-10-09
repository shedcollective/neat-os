# inspect-before-inventing

Read the existing architecture and comparable code before creating a new pattern.

**Applies when** about to add a file, helper, convention or structure that a repo may already have in another shape; when retrofitting a mature repo; when a template slot seems empty.

**The decision it changes.** Whether anything new is created at all. Cite the existing pattern and extend it. If a hand-written guide or platform leaf exists, it is cited, not clobbered. A mature repo gets its slots filled from files already read, not from a greenfield questionnaire.

**Source.** the `gather` preconditions in [`skills/gather/SKILL.md`](../skills/gather/SKILL.md): read the existing Agent Guide and project files first, and do not run a greenfield questionnaire over facts the repository already holds.
