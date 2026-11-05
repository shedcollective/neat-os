---
name: staging-board
description: >-
  Classify each staging server as free, in use, or check with deployer from
  the latest deployment and the ticket status. Write the board only when the
  rendered content changes. Read-only on every source. Not a launch playbook.
---

# staging-board

Answer which staging server is free to deploy onto. Read the deploy service and the ticket tracker, then classify each staging server. The board carries its own evidence: who deployed, how old the deploy is, the ticket and its status, and a link to the deployment.

This serves both aims in [PURPOSE.md](../../PURPOSE.md). A person can trust the status without opening each source, because the board holds that evidence. It also turns the repeated question of who is on a staging server into a step the routine runs.

This is **not** a launch playbook. Locate neat-os the same way `init` does. **Do not** search the public web for neat-os. **Do not** copy this playbook into `.agents/skills/`.

It is an agency operations playbook ([docs/agency-ops.md](../../docs/agency-ops.md)). The concrete deploy service and the concrete tracker are settings. This playbook does not name a product.

## When to use

- A scheduled routine should refresh the staging board for the routine owner.
- Someone asks which staging server is free to deploy onto.

## When not to use

- Triggering a deploy, or changing a ticket. Both stay with a person ([keep-human-gates](../../principles/keep-human-gates.md)).
- The weekday morning message (that is [`morning-brief`](../morning-brief/SKILL.md)). That playbook may read this one. It does not write the board.
- Writing the day file (that is [`daily-burndown`](../daily-burndown/SKILL.md)).

## Settings

The routine supplies these values, named as in [conventions/routine-settings.md](../../conventions/routine-settings.md): `<destination>`, `<tracker-host>`, `<connectors>`, `<quiet-when-empty>`, and `<timezone>`. If a required setting is missing, ask once and stop ([never-invent-facts](../../principles/never-invent-facts.md)). Do not invent a status name to fill a gap.

These settings belong to this playbook. Real values live in the wrapper, never in this repository ([neutral-reference.md](../../conventions/neutral-reference.md)). A wrapper pins a release tag ([routine-settings.md](../../conventions/routine-settings.md)).

| Setting | Required | Meaning |
| --- | --- | --- |
| `<deploy-project>` | yes | The project in the deploy service whose servers and deployments this run reads. |
| `<staging-servers>` | yes | Which servers count as staging, in board order. |
| `<tracker-project>` | yes | The tracker project key for the tickets on those branches. |
| `<board>` | for a scheduled write | Where the board is written, for example a chat canvas id. An on-request reply does not need it. |
| `<free-branches>` | yes | Default or release branch names that count as free. |
| `<done-statuses>` | yes | Ticket status names that count as done. Only these names. |
| `<active-statuses>` | yes | Ticket status names that count as active. Only these names. |
| `<age-threshold>` | no | How old a deploy with no ticket must be before the class is Check with deployer. Default 24 hours. |
| `<history-length>` | no | How many recent deploys to list per server. Default 10. |
| `<DEPLOY_TOKEN_ENV>` | when `<connectors>` cannot read the deploy service | The name of the environment variable that holds the deploy API key. Never the key. |

`<connectors>` are the asker's own connected accounts, never another person's. `<destination>` is where an on-request reply goes when the ask has no thread. A question in a channel is answered in that thread. A scheduled run does not also post to `<destination>`.

`<quiet-when-empty>` applies to the scheduled write. See [Steps](#steps).

If the same status name is in both `<done-statuses>` and `<active-statuses>`, ask once and stop. Do not pick a class.

## Who may write

A scheduled run may write `<board>` through the routine owner's own connected account, on a standing permission that covers `<board>` only.

Someone asking in a channel gets a read-only reply in the thread. That reply uses the same classification. It never writes `<board>`. Writing as another person's account would break `<connectors>`.

A bot-owned app writing the board is out of scope. That would need a new rule.

## Hard rules

- **Read-only on every source.** Read servers, deployments, and ticket status. Never trigger a deploy. Never change a ticket.
- **The branch comes from the deployment**, not from the server's default branch.
- **Never invent a status**, a ticket key, a branch, or a server. A status that is not in `<done-statuses>` or `<active-statuses>` is not forced into either list.
- **No secrets.** The deploy key is the name in `<DEPLOY_TOKEN_ENV>` and is never written into the board, the reply, or the wrapper ([never-store-secrets.md](../../conventions/never-store-secrets.md)).
- **Write the board only when the rendered content changes.** Post nothing else.
- The live board uses the server names, branch names, and people the sources return. Examples in this playbook stay placeholders (`<server>`, `<person>`, `ACME-123`). Do not name a bot ([writing.md](../../conventions/writing.md)).

## Classify

Take one staging server and its latest deployment. Decide in this order, and stop at the first match:

1. The deployment branch is one of `<free-branches>`. The server is **Free**.
2. The branch contains a ticket key and that ticket's status is one of `<done-statuses>`. The server is **Free**.
3. The branch contains a ticket key and that ticket's status is one of `<active-statuses>`. The server is **In use**.
4. The branch has no ticket key and the deploy is younger than `<age-threshold>`. The server is **In use**.
5. The branch has no ticket key and the deploy is at least `<age-threshold>` old. The server is **Check with deployer**.

When the ticket's status is not in either list, or the status or the age could not be read, leave the class unset. Record what the tracker returned, or that the read failed. Do not invent the missing fact.

A ticket key is the key inside the branch name. `feature/acme-123-checkout` yields `ACME-123`. When the branch contains no key, there is no ticket. Look the key up on `<tracker-host>` in `<tracker-project>`.

Age is the time from the deployment's recorded time to now, shown in `<timezone>`. A deploy exactly `<age-threshold>` old is **Check with deployer**.

## Render

A table, then the recent deploys, then one ref line. Columns, in this order: Server, Free?, Branch, Deployed by, Age, Ticket, Ticket status, Deploy.

Free? is `Yes` when the class is Free, `No` when it is In use, and `Check with deployer` when it is that class. Leave Free? empty when the class was not set.

Deploy is the deployment's short id, linked to that deployment in the deploy service. Ticket is the key, linked under `<tracker-host>`, or empty when there is no ticket. Ticket status is the name the tracker returned, unchanged. Deployed by is the person the deployment record names, or empty when it names nobody.

After the table, list the last `<history-length>` deployments per server (default 10), newest first. One line each: short id, branch, who deployed, age.

The ref line is last. It starts with `ref:` and then one `<server>=<deploy-id>` pair per staging server, in `<staging-servers>` order, separated by spaces. The id is that server's latest deployment. A server with no deployment uses `<server>=none`. Later runs, including [`morning-brief`](../morning-brief/SKILL.md), compare this line with the latest deploys.

```
| Server | Free? | Branch | Deployed by | Age | Ticket | Ticket status | Deploy |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <server> | Yes | main | <person> | 2 days | | | a1b2c3d4 |
| <server> | No | feature/acme-123-checkout | <person> | 3 hours | ACME-123 | <status> | e5f6a7b8 |

<server>
- a1b2c3d4 main <person> 2 days

ref: <server>=a1b2c3d4 <server>=e5f6a7b8
```

`<status>` in the example is not a status this playbook defines. The cell is the name the tracker returned.

## Steps

1. Confirm the settings. If a required setting is missing, ask once and stop. Do not invent a status, a server, or a branch name.
2. Choose the path in [Who may write](#who-may-write). A person asking in a channel is the read-only path. A scheduled run by the routine owner is the write path.
3. Read `<deploy-project>`'s servers and recent deployments, read-only. Use `<connectors>` when the deploy service is connected. Otherwise use the key named by `<DEPLOY_TOKEN_ENV>`. Never write the key. Never trigger a deploy.
4. For each server in `<staging-servers>`, take the latest deployment that includes it. Use that deployment's branch. Do not use the server's default branch. If the recent read has no deployment for that server, record that and leave the branch empty.
5. When the branch contains a ticket key, read that ticket's status on `<tracker-host>` in `<tracker-project>`, read-only. When it does not, there is no ticket.
6. Classify each server with [Classify](#classify).
7. Render the table, the recent deploys, and the ref line with [Render](#render).
8. On the read-only path, reply in the thread with that render. Post nothing else. Do not write `<board>`.
9. On the write path, compare the render with the current content of `<board>`. Write `<board>` only when they differ, through the routine owner's own connected account. An unchanged board is not rewritten, whichever way `<quiet-when-empty>` is set. When there is nothing to classify, follow `<quiet-when-empty>`: `yes` stays silent, and `no` writes an explicit empty stub. Post nothing else.

## Stop

Complete when the board was written because the render changed, or when the scheduled run wrote nothing because the render was unchanged or `<quiet-when-empty>` said to stay silent, or when the on-request reply was posted in the thread. Not complete if a deploy was triggered, a status or a ticket key was invented, a secret was written, an on-request run wrote the board, a bot-owned app wrote the board, or anything other than the board or that thread reply was posted.
