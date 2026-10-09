# shedcollective/neat-os (Composer)

The PHP side of neat-os. It exists so a PHP project can declare the dependency and read the version. It carries metadata only and does not ship `skills/`, `templates/`, `principles/`, or `conventions/`.

| This package provides | This package does not provide |
| --- | --- |
| The package name and version | The knowledge folders |
| `Neat\Os\NeatOs::version()` | Path helpers that locate those folders |
| `Neat\Os\NeatOs::knowledgeSourceHint()` | A search through `vendor/` for `SKILL.md` files |

The repository root [`composer.json`](../../composer.json) is the Composer source of truth. This directory holds the library code under `src/` and is not the entry point. Both `name` values stay `shedcollective/neat-os`.

How to install the package is described once, in [docs/consume.md](../../docs/consume.md).

```php
use Neat\Os\NeatOs;

NeatOs::version();             // the version in composer.json
NeatOs::knowledgeSourceHint(); // a sentence saying where the knowledge folders live and how to install them
```

A PHP project that needs the playbooks installs the Node package `@shedcollective/neat-os` as well, or works from a checkout. Start at the root [README](../../README.md).
