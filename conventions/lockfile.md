# Package manager

**Locked:** the lockfile beside a manifest names the installer for that directory.

| Lockfile | Installer |
| --- | --- |
| `yarn.lock` | Yarn. Do not create `package-lock.json` in the same directory. |
| `package-lock.json` | npm. Do not create `yarn.lock` in the same directory. |
| `pnpm-lock.yaml` | pnpm. |

A second lockfile in a different directory is a different root, not a conflict. Do not run `npm install` or `npm add` in a directory that already has `yarn.lock`. Do not run `yarn` in a directory that already has `package-lock.json`. Do not invent a second lockfile beside the one that is already there.

`npm run` as a script runner is not an installer. The rule is about `install`, `add`, and `remove`, and about which lockfile is updated.

If two JavaScript lockfiles exist in the same directory, stop and surface the conflict. Do not pick.

`composer.lock` is the same shape for PHP: Composer is the installer for the directory that holds it.

Which lockfiles a given product repo has is project knowledge (`AGENTS.md` / Agent Guide). This page is only the mapping. `gather` reads the tree; it does not ask which installer to use when exactly one JavaScript lockfile is present in a directory.

**Source.** A learn draft recorded in the archive repository (nested roots).
