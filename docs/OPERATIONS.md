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

Use D1 database export for a full operational backup including revisions; portable article JSON exports omit history and credentials. Keep full backups private because they include unpublished material and credential hashes. Test restoration in a separate database before replacing live storage. A full D1 export was restored and integrity-checked in a separate local SQLite database on 9 October 2026. A remote disaster-recovery cutover was not performed. Earlier article content can be recovered as a new draft; migrations retain previous revisions but arbitrary reverse-schema migration requires an explicit validated proposal.

The workspace is now a Git repository with the authorized public GitHub remote. The first pushed commit passed GitHub CI. Production domain/name, corpus licensing, real data import and model/service credentials remain separate decisions.

The live preview schema is version 3: the category field is free text, labeled “Раздел словаря”. `scripts/upgrade-topics.py` performs this compatible change via authenticated schema preview/apply and is idempotent when the field already supports free topics. To upgrade a freshly seeded local database, set `NEUROLEX_BASE_URL` to its local Worker origin and run the same script with the matching `.author-key`/`.dev.vars` configuration. It uses no uploaded JavaScript transformations and prints no credentials. Navigation categories are derived from visible article values plus seed categories; unpublished-only topic names are not sent to public readers.

## Public repository and delivery

The public repository is https://github.com/alexandr-panchenko/neurolex. Initial GitHub checks passed. Public `wrangler.jsonc` is a redacted template; ignored `.wrangler.local.jsonc` holds actual local deployment settings. Use `bun scripts/deploy.ts` for a local deployment, and `bun scripts/deploy.ts d1 migrations apply neurolex-preview-data --remote` for reviewed migrations. The wrapper uses explicit CI environment values when supplied.

GitHub Actions checks pull requests and main pushes. Main deployment is enabled only after `DEPLOY_ENABLED=true` and private repository secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `AUTHOR_EMAIL` are provisioned. `scripts/configure-github.py <private-token-file>` provisions these without printing credentials and dispatches the workflow. Use an account-restricted API token with Workers Scripts Edit and D1 Edit. Current local OAuth credentials are not copied to GitHub. Live automatic delivery remains unverified until this token is supplied.

`bun run backup` exports live D1 into ignored mode-0700 `backups/`, executes the complete SQL into a separate mode-0600 SQLite database, checks integrity, parses article/revision/schema records, and writes a private verification report. This verifies full export restoration locally; it does not replace the live database or claim a remote disaster-recovery cutover. Never upload these private SQL files as public Actions artifacts.

## Embedded assistant and Parallel

Server settings are in `.env.example`. `env PATH=/usr/bin:$PATH python3 scripts/configure-services.py <private-settings-file>` uses Wrangler bulk secrets for keys and explicit model IDs. Model IDs are not guessed. This repository uses the OpenAI Responses API and Gemini Interactions API; external source search uses Parallel `/v1/search`. Official references: https://developers.openai.com/api/docs/guides/function-calling, https://ai.google.dev/gemini-api/docs/function-calling, https://docs.parallel.ai/search/search-quickstart.

The assistant requires author/agent read access. Default tools are read-only; explicit conversation controls enable draft writes, schema changes and publication within existing actor permissions. Current schema and optimistic operations remain authoritative. Tools record the embedded actor and report actual results; provider failures retain completed action traces. Requests have replay protection, five-round/sixteen-tool limits, 2,000 output tokens per model call, bounded input, twenty requests per actor-hour and two hundred account-wide requests per day. These are usage bounds, not a dollar-denominated billing cap. No provider/live model or Parallel success is claimed without keys and a live test.

## Pilot import and feedback

Import CSV/TSV with header mapping to current fields, or the documented JSON bundle. Preview shows current/incoming field differences. Replacements require explicit selected fields and the revision observed in preview; a stale replacement fails without writing. New fields fill absent values conservatively. Repeated simple values use semicolons or JSON arrays; nested groups use JSON cells. Up to 100 documents per batch.

NLM MeSH retrieval uses only canonical descriptor/concept endpoints; it preserves source ID, concept URL, retrieval date, descriptor last-update and NLM attribution/terms. Russian equivalents are author-supplied. MeSH does not supply podcast examples. Terms: https://www.nlm.nih.gov/databases/download/terms_and_conditions_mesh.html. InterLex requires separately verified access and mapping and is not claimed by this adapter.

Signed-in users submit contextual feedback through the article. Feedback stays private in D1 and the owner reads it in the feedback view or GET `/api/feedback`.

## Selected assistant model and private provisioning

The author selected OpenAI GPT-6 Luna (`gpt-6-luna`), documented at https://developers.openai.com/api/docs/models/gpt-6-luna. It supports Responses API function calling. The selection does not establish account entitlement or a live successful call; keys are still required. `.env.example` records the selection without credentials.

Create a private file outside the repository, for example `~/.config/neurolex/services.env`, with mode 0600 and these entries:

```dotenv
OPENAI_API_KEY=your-private-key
OPENAI_MODEL=gpt-6-luna
CHAT_PROVIDER=openai
```

Give the local implementation agent only that file path. The provisioning script sends permitted values to Worker secrets without printing the key. Never paste credentials into chat, browser messages or public Git. After provisioning, perform a bounded read-only tool call and then a draft edit to verify real model/tool behavior. Parallel needs its separate PARALLEL_API_KEY for external research.

External clients share the same dictionary protocol: stateless Streamable HTTP MCP at `/mcp`, with `Authorization: Bearer <dictionary credential>`. Client differences concern where the URL/header or secret environment is configured, not dictionary permissions or operations. This dictionary credential is distinct from the OpenAI key and does not purchase model access. Use the HTTP API when a client's MCP transport cannot supply the required header; browser OAuth discovery is not currently provided.

## Inviting a human author

No self-service registration is enabled. The owner opens User and agent access, chooses Author, supplies a recognizable name/email (a label, not a verified mailbox), and grants read/write, optionally publish. The personal invitation expires after 30 days; pass it privately. The recipient opens the site, selects Author sign-in and enters the key. Browser sessions last up to eight hours and use the same revocable credential; logging out clears the cookie without consuming the invitation. Owner revocation immediately invalidates browser/API use and future sign-in. Invited authors cannot manage credentials or the global schema. Read permission exposes all dictionary drafts/history, not only that author's articles. Do not share the owner .author-key. Cloudflare Access email registration remains a separate pending configuration.

`.env.local` is explicitly ignored as well as covered by `.env.*`; only .env.example is public. The supplied OpenAI key is stored in Worker secrets with OPENAI_MODEL=gpt-6-luna and CHAT_PROVIDER=openai. Gemini credentials are available privately but no Gemini model has been selected. Parallel and a Cloudflare CI deployment API token were not supplied.
