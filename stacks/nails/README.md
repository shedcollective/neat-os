# Nails stack pack

Company rules for Nails PHP applications. `gather` links this pack from a product `AGENTS.md` when the tree is a Nails app. Agents read the files from the resolved neat-os tree. They are never copied into the product repo ([ADR-0013](../../docs/decisions/0013-stack-packs-in-shed-os.md)).

| Rule | When |
| --- | --- |
| [admin-uses-api.md](admin-uses-api.md) | Building or changing a Nails admin screen that needs JSON |
| [factory-not-new.md](factory-not-new.md) | Adding or calling a Nails-managed class |
| [fix-at-source.md](fix-at-source.md) | A bug or gap looks like it belongs in a Nails package |
| [views-use-curly-braces.md](views-use-curly-braces.md) | Writing or editing a PHP view |

A Laravel or WordPress pack is added when there is a proposal. Do not invent one here.
