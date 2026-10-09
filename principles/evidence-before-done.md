# evidence-before-done

"Done" is a claim backed by evidence from the real artefact. Name what was not verified; absence of evidence is not a pass.

**Applies when** reporting completion of any task, opening a PR, or marking a playbook step finished.

**The decision it changes.** The report. Instead of "tests pass", it gives the exact command, its result, what behaviour was exercised, what could not be run and why, and the residual risk. Verification is against the running thing (the scaffold on disk, the installed package, the rendered page), not against "it compiles" or a self-summary.

**Source.** `bash scripts/check` is the only definition of "green" in this repository ([docs/contributing.md](../docs/contributing.md)); [pstack](https://github.com/cursor/plugins/tree/main/pstack) states the same rule as "prove it works".
