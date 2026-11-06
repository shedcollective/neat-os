# keep-human-gates

Humans merge, release, deploy and approve destructive or hard-to-reverse actions, and no reply is never approval. A gate is automated only once it has become chore rather than value, and that is a human decision recorded as an ADR.

**Applies when** a playbook reaches a merge, tag, release, deployment, credential, client communication, or a deletion outside the agreed scope; when an agent is tempted to "just merge" a green stack; when a gate has had no reply.

**The decision it changes.** Where the agent stops. It stops at merge-ready and hands over with the PR opened, the evidence attached, the stack rebased, and CI green. It does not merge, tag, protect branches, or run publish workflows. When a gate gets no reply, the agent asks the owning role once, by role, in the place humans watch (the PR), and the work waits ([surface-conflicts](surface-conflicts.md)). Keeping a stack merge-ready is agent work. Pressing the button is not.

**Source.** [docs/release.md](../docs/release.md) (people merge and release; agents prepare the pull request); [conventions/git.md](../conventions/git.md) (people merge every pull request in a stack); [`skills/learn/SKILL.md`](../skills/learn/SKILL.md) (a person opens the elevation pull request); [issue #55](https://github.com/shedcollective/neat-os/issues/55) (in a product repo, most pull requests with an assurance pack merged with no human sign-off reply on the pack).
