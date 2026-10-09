---
name: nails-factory-not-new
description: In Nails apps, load models, services, and resources through Factory. Do not new them.
---

# nails-factory-not-new

Load Nails-managed classes through `Nails\Factory` (`Factory::model()`, `Factory::service()`, `Factory::resource()`, and the other Factory methods the app already uses). Do not instantiate them with `new`. Constructor injection of a Factory-loaded instance is fine; constructing the managed class yourself is not.

When adding a new model, service, or resource, copy the nearest existing example in `src/` rather than inventing a loader.

## When to use

Adding or calling a Nails model, service, resource, or email factory.

## Steps

1. Find the nearest existing caller of the same kind of class.
2. Load it with the same Factory method and module name that caller uses (`app` vs a `nails/module-*` key).
3. Do not `new` the class. Do not add a manual `require` for something Composer already autoloads.

## Stop

If Factory cannot resolve the name, stop and match an existing registration (composer extra, module install). Do not bypass Factory to make the call compile.

**Source.** Recorded in the archive repository.
