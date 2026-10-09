# encode-lessons-in-structure

When a failure repeats, add a script, test, template slot or convention, not more prose.

**Applies when** you are about to write a sentence telling agents not to do something they have already done twice, or about to restate a rule that exists elsewhere.

**The decision it changes.** What gets written when a lesson lands. Instead of a new paragraph in a skill or README, the lesson becomes a check in `scripts/check-*`, a slot in a template, a line in `conventions/`, or a script flag. If the rule genuinely cannot be code, write it once and point at it by path.

**Source.** this repository's own history: the same install rule was once restated in eight files and pinned by phrase-matching tests, until a pull request recorded in the archive repository replaced them with `scripts/check-structure.js` and `scripts/check-policy.js`. [pstack](https://github.com/cursor/plugins/tree/main/pstack) has a principle of the same name.
