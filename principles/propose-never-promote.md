# propose-never-promote

Agents may draft skill, playbook or principle candidates. Only a human PR elevates them into neat-os (including a stack pack) or a tool repository.

**Applies when** `learn` finds a pattern worth keeping; when a product-repo agent wants to "fix" a company skill; when a Cloud Agent could push to an org knowledge repo.

**The decision it changes.** What the agent produces. The artefact is a draft under the product repo's `.agents/proposals/`, with evidence and a suggested destination, and the run stops. The agent does not open a PR against neat-os, does not edit `node_modules/@shedcollective/neat-os`, and does not copy skills into the product repo to "improve" them.

**Source.** [`skills/learn/SKILL.md`](../skills/learn/SKILL.md); [ADR-0002](../docs/decisions/0002-launch-skill-split.md), which fixes `learn` as the playbook that proposes and never publishes; the `.agents/proposals/` folder that `init` creates for those drafts.
