---
name: nails-fix-at-source
description: When a bug or gap belongs in Nails, fix the Nails package. Do not paper over it in the app.
---

# nails-fix-at-source

When the right fix belongs in Nails (core, a module, or shared framework behaviour other apps would want), **fix it in that Nails package**. Do not default to an app override, a copy of vendor code, or a shim that hides the bug.

A documented app extension point (a driver, hook, or `app/` subclass the module already expects) is not papering over. Product-only domain logic stays in the app.

## When to use

A bug or missing behaviour in a Nails product app looks like it lives in a Nails package (`nails/*` on Composer, `vendor/nails/*`, or shared admin, API, or module behaviour).

## Steps

1. Decide whether the change is shared Nails behaviour or product-only. Shared means other Nails apps would want the same fix or feature.
2. Name the Composer package and the GitHub repo (`nails/common`, `nails/module-cms`).
3. Open a GitHub issue on that repo with `gh issue create --repo nails/<name>` and assign the package maintainers listed in that repo's README or CODEOWNERS. Tell the human in the same turn.
4. If that repo is already a workspace root, open a pull request there that links the issue. Do not merge it.
5. If that repo is not in the workspace, stop after the issue. Tell the human a pull request is preferred. Do not clone a Nails repo unsolicited. Do not edit `vendor/`.
6. If the product ticket is blocked, a temporary app patch is allowed. The patch comment and the product pull request must say it is temporary and must name the Nails issue.

## Stop

If the behaviour is product-only, or the module already documents an extension point for it, fix it in the app. Do not copy a Nails package into the app. Do not leave a silent override.

**Source.** Recorded in the archive repository.
