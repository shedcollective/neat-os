# script-checks-formats

Commit ticket keys and pull request title formats are checked by a script, because that is where agent output varies most. The agent runs the check and fixes what it reports, and it is not the authority on whether a format is right.

**Applies when** writing a commit message or a pull request title, and when about to claim that either format is correct.

**The decision it changes.** Who decides a format is right. The check belongs in `scripts/`. The agent runs that check and fixes what it reports. Until the check exists, the agent names the gap in the pull request body and does not claim the format is correct.

**Source.** [issue #55](https://github.com/shedcollective/neat-os/issues/55). Across the last 85 pull requests in one product repo, titles came in at least six shapes, and fewer than half of the commits carried a ticket key. Agents are not the authority on green ([Determinism](determinism.md)).
