# never-store-secrets

Never store secrets, credentials, or project-specific information in this repository.

**Applies when** a change would add a password, a token, a key, a credential, or a fact that is true of only one product repository, whether in a file, an example, a commit message, or a note.

**The decision it changes.** Where that material goes. A secret or a credential goes in an environment variable, or in another store outside this repository. A fact about one product repository goes in that repository's own docs, such as its `.agents/project.md`. This repository keeps the rule.

**Source.** This file. Names of people, clients, projects, products, and bots stay in [conventions/neutral-reference.md](../conventions/neutral-reference.md).
