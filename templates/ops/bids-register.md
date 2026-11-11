# Bids register

Private operations record only. One row per bid from Stage `pursuing` onwards (the current version). Stage is `pursuing`, `submitted`, `won`, `lost`, or `withdrawn`. Check for a duplicate by buyer and reference before adding a row. A proposal or quote the operations lead emailed straight to a prospect (source `sent-mail`) enters at `submitted` on the send date, with Portal `email`. Never credentials, portal logins, or tokens. Amounts in this file are for the operations lead; do not copy them into a shared digest.

Each successful submission also has a folder `bids/<yyyy-mm-dd>-<buyer-slug>-<ref>/` holding `submission.md` and the individual redacted files that were sent (not the zip). A resubmission is a new version. The earlier folder's `submission.md` is marked superseded.

| Buyer | Reference | Portal | Stage | Submitted | Notice value | Bid value | Status | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `<buyer>` | `<reference>` | `<portal>` | `<stage>` | `<YYYY-MM-DD>` | `<notice value>` | `<bid value>` | `<status>` | `<outcome>` |
