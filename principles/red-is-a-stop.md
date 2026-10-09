# red-is-a-stop

A red required check on the integration branch is the first task, not background noise. Nothing new is branched, stacked or merged onto red.

**Applies when** starting any task, cutting a branch, opening a PR, or asking a human to merge. Read the latest run on `develop` first. Especially when the failure took 0 s or has no job log: that is a broken workflow, not flaky infrastructure.

**The decision it changes.** The first commit. Instead of the feature, the agent fixes the check (or surfaces it if the cause is outside its scope) and adds a structural guard so the same red cannot return silently. Work that was already stacked on red is rebased once green. The agent does not merge the fix itself ([keep-human-gates](keep-human-gates.md)).

**Source.** Pull requests recorded in the archive repository were merged onto a `develop` whose `validate.yml` had been failing in 0 seconds because of an unquoted colon in a step name. The failure was found a day later and fixed in a later pull request recorded in the archive repository, with a guard in `scripts/check-structure.js` so it cannot return silently. The learn draft is recorded in the archive repository.
