# Never store secrets

**Locked:** this repository does not store secrets, credentials, or project-specific information.

A password, a token, a key, a credential, or a fact that is true of only one product repository does not belong in a file, an example, a commit message, or a note in this repository.

A secret or a credential goes in an environment variable, or in another store outside this repository. A fact about one product repository goes in that repository's own docs, such as its `.agents/project.md`.

Software can check for a secret in the tree, so the rule lives here. Client names, client projects, and internal chat are in [neutral-reference.md](neutral-reference.md). Who a commit names is in [attribution.md](attribution.md).

**Source.** The elevation bar in [docs/contributing.md](../docs/contributing.md).
