# keep-human-gates

Humans merge, release, deploy and approve destructive or hard-to-reverse actions. A gate is automated only once it has become chore rather than value, and that is a human decision recorded as an ADR.

**Applies when** a playbook reaches a merge, tag, release, deployment, credential, client communication, or a deletion outside the agreed scope; when an agent is tempted to "just merge" a green stack.

**The decision it changes.** Where the agent stops. It stops at merge-ready and hands over with the PR opened, the evidence attached, the stack rebased, and CI green. It does not merge, tag, protect branches, or run publish workflows. Keeping a stack merge-ready is agent work. Pressing the button is not.

**Source.** [docs/release.md](../docs/release.md) (people merge and release; agents prepare the pull request); [conventions/git.md](../conventions/git.md) (people merge every pull request in a stack); [`skills/learn/SKILL.md`](../skills/learn/SKILL.md) (a person opens the elevation pull request).
