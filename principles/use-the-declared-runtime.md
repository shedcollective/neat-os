# use-the-declared-runtime

If the Agent Guide names a runtime (Sail, Compose, a Makefile target), run the toolchain through that surface. Host `php`, `composer`, `npm`, and `yarn` are not substitutes.

**Applies when** running, installing, migrating, testing, or building in a product repo whose guide has a Critical Docker, container, or Make section.

**The decision it changes.** The command. Use the documented wrapper (and the documented user, for example `--user=1000:1000`). If that surface cannot run in this environment, stop and say so. Do not make progress on the host.

**Source.** Recorded in the archive repository.
