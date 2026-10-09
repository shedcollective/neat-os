# @shedcollective/neat-os

The Node module behind the `@shedcollective/neat-os` package. It exports the version, the paths to the knowledge folders (`skillsDir`, `templatesDir`, `principlesDir`, `conventionsDir`), and `resolveConsume()`, which finds a neat-os install using the locked resolve order. The packed tarball also includes `stacks/`. This module does not export a path for it. Playbooks read that pack from the resolved tree. The repository root [`package.json`](../../package.json) re-exports this module so that a sibling `file:` install and a tagged git install behave the same way.

How to install the package is described once, in [docs/consume.md](../../docs/consume.md).

```js
const neatOs = require('@shedcollective/neat-os');
neatOs.version;
neatOs.skillsDir;
const hit = neatOs.resolveConsume();
```

`init` copies its templates from `templatesDir` and leaves them unfilled. `gather` fills them. Neither copies skills into the product repository. Start at the root [README](../../README.md).
