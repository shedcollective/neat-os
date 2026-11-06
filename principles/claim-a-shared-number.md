# claim-a-shared-number

Before a worker uses a shared sequential number, it claims that number. The claim is the first number above both the highest on the integration branch and any number an open pull request already uses, and the worker checks again before marking ready.

**Applies when** a change needs the next value from a sequence other workers can take at the same time, for example a database migration number.

**The decision it changes.** Which number is used. The worker reads the integration branch and the open pull requests, takes the first free number above both, and reads them again before marking ready. A number already used on an open pull request stays taken.

**Source.** [issue #55](https://github.com/shedcollective/neat-os/issues/55). Two open pull requests in a product repo used the same migration numbers, and a hand renumber commit was needed.
