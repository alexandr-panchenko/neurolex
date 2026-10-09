# Preview operations

Worker: `neurolex-preview`; URL https://neurolex-preview.sanocks.workers.dev. Account and database identifiers are in `wrangler.jsonc`. D1 `neurolex-preview-data` is authoritative for current schema, articles, publication snapshots, immutable revisions, delegated credentials and idempotency receipts. Search is rebuilt from the published snapshot rather than maintained in a second authority. Artifacts was live-probed successfully but was not selected for runtime writes; see ARTIFACTS-EXPERIMENT.md. No paid plan was enabled.

```sh
env PATH=/usr/bin:$PATH bun run check
env PATH=/usr/bin:$PATH bunx wrangler d1 migrations apply neurolex-preview-data --remote
env PATH=/usr/bin:$PATH bunx wrangler deploy
```

Review a migration before running it remotely. Historical seed migrations create sample content once; do not rerun seed scripts as live replacement operations. Application schema migrations use the authenticated preview/apply operations instead of SQL patches.

The owner-key provisioning script stores a random existing/new key in ignored `.author-key` (0600), its hash in ignored `.dev.vars`, and the Worker `AUTHOR_KEY_HASH` secret. It prints no key. Run only when provisioning/recovering this deployment is intended. Sessions use secure HttpOnly SameSiteStrict cookies, expire after eight hours, and are revoked on logout. Agent credentials are hashed, expire after 30 days and are individually revocable. Do not log Authorization headers, cookie values, or login request bodies.

## Cloudflare Access email login — pending configuration

The selected author is `the confirmed author email`. Wrangler OAuth access to Workers/D1 was verified; the Access organization endpoint returned an authentication error. Owner-key login provides the real working author path meanwhile.

In the Cloudflare Zero Trust dashboard, configure an Access self-hosted application for this host and **only `/auth/access`**, with an Allow policy restricted to `the confirmed author email` and one-time email PIN. Do not protect public article/API/MCP reading or the agent Bearer endpoint with an Access browser challenge. Set Worker variables `ACCESS_TEAM_DOMAIN` to the configured team host and `ACCESS_AUD` to that application's audience tag, then redeploy. The Worker verifies issuer, audience, signed JWT and exact allowed email; trusting a forwarded email header alone is forbidden. Verify an actual allowed and denied login before describing email login as complete. These two non-secret configuration values are currently absent; no Access application or OTP delivery was verified.

## Backup and recovery

Use D1 database export for a full operational backup including revisions; portable article JSON exports omit history and credentials. Keep full backups private because they include unpublished material and credential hashes. Test restoration in a separate database before replacing live storage. Automatic backup/restore drills have not been run. Earlier article content can be recovered as a new draft; migrations retain previous revisions but arbitrary reverse-schema migration requires an explicit validated proposal.

The workspace is not an initialized Git repository. GitHub account read access was verified, but no matching repository/remote was established; no commits, push or GitHub CI success are claimed. Production domain/name, corpus licensing, real data import and model/service credentials remain separate decisions.

The live preview schema is version 3: the category field is free text, labeled “Раздел словаря”. `scripts/upgrade-topics.py` performs this compatible change via authenticated schema preview/apply and is idempotent when the field already supports free topics. To upgrade a freshly seeded local database, set `NEUROLEX_BASE_URL` to its local Worker origin and run the same script with the matching `.author-key`/`.dev.vars` configuration. It uses no uploaded JavaScript transformations and prints no credentials. Navigation categories are derived from visible article values plus seed categories; unpublished-only topic names are not sent to public readers.
