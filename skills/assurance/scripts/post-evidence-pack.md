# Post the assurance evidence pack

This page is the command that creates or updates the single `## Assurance evidence pack` comment on a pull request. The assurance playbook decides the comment text. This command only writes it. The playbook steps stay in [../SKILL.md](../SKILL.md).

## Run the command

Set `NEAT_ASSURANCE_APP_PRIVATE_KEY` to the assurance GitHub App private key. The key is PKCS#1, with the header `BEGIN RSA PRIVATE KEY` and the matching footer. A normal key, with line breaks, works. A one-line key works too. The command splits off the header and footer, removes whitespace from the body, and wraps the body at 64 characters.

The command reads the key from that variable. It never prints the key, the App JWT, or the installation token.

```bash
node skills/assurance/scripts/post-evidence-pack.js \
  --repo <owner>/<name> \
  --pr <number> \
  --head-sha <sha> \
  --body-file <path>
```

`<sha>` is the 40-character head SHA the run assured. `<path>` is a file that holds the comment body. The body is sent as it is in the file.

The command mints an App JWT (RS256). `iat` is 60 seconds in the past. `exp` is 10 minutes after `iat`. It exchanges that JWT for an installation token limited to the one repository in `--repo`. The App id on the JWT is `5428024`.

The installation id comes from `GET /repos/<owner>/<name>/installation`. When that request fails, the command uses installation id `174165018` and continues.

Leave `NEAT_ASSURANCE_API_BASE` unset when you run the command against GitHub. The tests set it to a local mock. It may use `http` only for `127.0.0.1` or `localhost`.

## What it writes

Immediately before it writes, the command reads the pull request head SHA again. When the current SHA is not `--head-sha`, the command posts nothing and exits 3. That run was superseded.

The command updates a comment whose body starts with `## Assurance evidence pack` when the assurance GitHub App wrote that comment. When more than one comment matches, the command updates the oldest, which is the lowest comment id. When no such comment exists, the command creates one. A comment with the same heading from any other author stays as it is.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | The comment was created or updated. |
| 1 | A step failed. The message names the step. This includes a 403, a 404, and a network error. |
| 2 | The arguments, the private key, or the body file cannot be used. |
| 3 | The pull request head SHA changed. Nothing was posted. |

## Tests

`bash scripts/check` runs the tests for this command. To run only those tests:

```bash
node --test skills/assurance/scripts/post-evidence-pack.test.js
```

The tests use a local mock of the GitHub API and a key generated while the test runs. They do not call GitHub.
