# enqueue-external-side-effects

When a repository already queues writes to an external system, new writes go through that queue. An inline call from a request is allowed only when the ticket says the request must wait.

**Applies when** adding or changing a create, update, or delete that talks to a CRM, bulk email, search index, or another remote API, and queue tasks for that system already exist.

**The decision it changes.** Where the call lives. Enqueue a payload the existing task family already understands. If no task fits, add a task next to its neighbours. Do not put the HTTP, SDK, or SOAP call in the controller, model save hook, or admin form handler unless the ticket requires a synchronous round-trip. This is not a rule to introduce a queue. Reading from the external system in-request is a separate decision.

**Source.** Recorded in the archive repository.
