# Artifacts suitability probe — 9 October 2026

OAuth whoami and the namespace list were live-tested with local Wrangler 4.149.0. The account initially had no namespaces. A temporary repo `storage-probe-20261009` was created in `neurolex-experiment` without changing any account subscription. Creation succeeded.

`scripts/probe-artifacts.py` obtained a 900-second repo write credential in memory and used the returned Git remote. No credential was placed in a remote URL, output or file. It performed these live checks:

- Write a schema and draft document together and clone/read them.
- Update schema, document and publication index in one commit and push.
- Attempt a stale push from a second clone: rejected.
- Clone again and verify all three files at the same commit and two retained revisions.

All checks passed; verified head was `622a5bca2c4468c890f3310f54923addac4e7d05`. The temporary repo was deleted after the experiment; its empty experiment namespace may remain. Issued credentials expire; the deleted repo is inaccessible.

This validates basic Git document storage, revision protection, and grouped updates. It does not validate Worker binding write operations, application authorization, migration semantics, search query performance, or deployed index refresh. Those remain necessary before choosing Artifacts as the application's authoritative store. The probe index is a file, not a complete search service.

Official documentation says Artifacts requires Workers Paid and billing for operations/storage begins 14 October 2026. Existing account creation succeeded, but this is not a claim that future usage has no cost. No plan upgrade or billing change was performed. See https://developers.cloudflare.com/artifacts/platform/pricing/ and https://developers.cloudflare.com/artifacts/api/git-protocol/.
