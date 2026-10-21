# Improvement records

The `improve` playbook writes one record here per improvement on the live product: `<ticket>-<slug>.md`, ticket key in lowercase. Each record carries a baseline taken before the change, the same measure taken after, and a summary a client can read.

The shape, the three categories (Measured, Counted, Observed), and the sign-off rule are company rules in neat-os, [conventions/improvement-record.md](https://github.com/shedcollective/neat-os/blob/develop/conventions/improvement-record.md). Who approves a summary and which measuring tools this project uses are in [../project.md](../project.md) under Improvements.

A record stays `status: draft` until a person sets it to `approved`. The summary leaves this repository only after that. Agents never set it.
