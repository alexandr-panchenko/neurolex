# Implementation plan

## Working delivery — 9 October 2026

The user reviewed the wiki mock, accepted its style, explained the required article/schema/browse interactions, and authorized continued implementation. That review is complete. The delivered increment is a real author-and-agent workflow, not localStorage demo publication.

URL: https://neurolex-preview.sanocks.workers.dev. Current Worker version: `49babdc8-048b-48e6-aa56-615b042582d4` (autosave/topic correction below). D1 `neurolex-preview-data` is authoritative. Three public illustrative articles, a private agent verification draft and a sourced private MeSH draft exist. Neurofeedback has a browser-saved draft demonstrating the optional discourse-functions field; its public publication remains the prior revision.

Implemented: public bilingual/content search and topic browsing; inline term/source references; stable public article HTML without JavaScript; actual JSON-LD/Turtle exports; private owner sessions and scoped revocable agent Bearer credentials; section-based editing; D1 saves, publication isolation, immutable revision history and restoration; article/schema/corpus optimistic conflicts; idempotency; global persisted schema, impact preview and atomic declarative migrations; current-schema driven editor and HTTP/MCP tools; conservative JSON document-bundle imports preserving existing local values. See README.md and docs/ for usage and supported limits.

Author email `the confirmed author email` was explicitly confirmed. Owner-key login works. Access email-code login has code but no configured application/team/audience or verified OTP delivery. Wrangler OAuth could administer Workers/D1, but the Access organization request was denied. The user is signed into the test browser with the actual owner session.

## Verification evidence

Local final check: strict TypeScript, zero-warning ESLint, **16 tests / 69 assertions**, Vite production build and Wrangler Worker dry run all passed. Tests cover actual SQLite transaction rollback, stale revisions/schema/corpus, idempotency, migration failure, private/public boundaries, scoped/expired/revoked credentials, forged email and cross-origin auth, conservative reimport, safe rich-text/citations, generated JSON Schema parity, RDF graph equivalence and positive/negative SHACL validation. These were the initial local checks; subsequent GitHub and pilot checks are recorded below.

Live Cloudflare checks passed: author sign-in; temporary delegated credential; MCP schema discovery and actual private document writes; stale revision rejection; optional-field schema migration v1 → v2; stale schema rejection; competing agent updates; draft exclusion from public search/exports; publication of a sample and persisted history; agent revocation. The temporary credential was revoked. Script: `scripts/verify-live.py`; running it mutates test articles and is not a harmless health check.

An initial deployed validator failed because Ajv generated executable code forbidden by Workers. It was replaced with runtime-safe recursive validation; the successful live mutation checks were run after the fix. Ajv remains only an independent generated-schema test oracle.

Final deployed read checks passed: exactly three public articles, no private verification draft, unpublished discourse-function value absent from public HTML, readable definition without JS, Turtle LexicographicResource, private history HTTP 401, private article URL HTTP 404, form ID HTTP 303, and anonymous MCP schema version 2. Health identifies D1 persistence and Access configuration false.

Browser checks: actual owner login, in-place rich editor and citation controls, saved new schema field, reload persistence, history with before/after values, restoration of an older version into the editor without overwriting server content. Responsive reading at configured width 390 showed no horizontal overflow; viewport reset. Final page screenshot: docs/working-wiki.jpg. No console warnings/errors observed on the final article. A later automation interaction stalled in a confirmation dialog; a fresh tab verified final rendering and responsive layout. History interaction was verified on the preceding deployment; the final localized labels/removal-diff change passed local checks, without claiming a second successful browser history interaction.

GitHub API access was verified as the repository owner. At initial delivery the workspace had no repository identity; the later authorized public repository and CI are recorded below. Cloudflare OAuth login and deployments are verified. Artifacts Git read/write/conflict/grouped update/history were live-probed and cleaned up. D1 was selected for straightforward Worker mutations; no paid plan was enabled.

## Next increments and actual dependencies

1. Provision the requested private Cloudflare API token, enable and live-test GitHub main deployments, and configure/live-test allowlisted Access email login. Public repository and successful CI are established; the deployment workflow and provisioning script are checked in. Owner-key login remains usable.
2. Provision OpenAI or Gemini keys with explicit model IDs and Parallel credentials, then run bounded live chat/tool/source-research checks. Both provider adapters, agent UI, scoped shared operations and Parallel are implemented and fixture-tested.
3. Enter/import the actual cards arriving tomorrow and use the private feedback path. CSV mapping, import differences/revision-checked field replacement and actual sourced MeSH draft import are available.
4. Targeted NeuroLex/NIFSTD snapshot import with explicit InterLex identifiers is now live-verified. A full/current authenticated InterLex API and arbitrary ontology imports remain outside the supported adapter.
5. Extend shared concept/episode identities or imported-baseline reconciliation as actual cards justify these richer semantics; do not claim full original NeuroLex compatibility.
6. Final name/domain, corpus license and production publication remain user decisions. Existing authorization covers the test site, public source repository and automatic test deployments.


The next user scenario is meaningful authoring: edit a section, save/reload a draft, inspect its history, and explicitly publish it when ready. The global schema is outside the article tabs and affects all articles; article fields are their displayed sections, not a second disconnected document.

## Article interaction correction — 9 October 2026

The user requested direct editing in the readable article and a rendered document diff instead of detached field forms and raw before/after values. Removed the article/edit tab arrangement. Authoring activates in place: title/equivalent keep their typography, rich text retains paragraph spacing, formatting controls appear only for the active rich-text area, and source metadata remains contextual. History selects a revision and renders the whole article with unchanged context, red removed/green added block pairs, stronger token-level highlights, retained rich formatting and links, and explicit addition/deletion indicators. Repeat groups and removed historical fields are included. Long diff inputs use a bounded fallback to prevent quadratic resource growth.

Final local checks passed: strict types, zero-warning lint, 18 tests / 80 assertions, Vite and real Worker dry-run build. New tests reconstruct both Russian word-diff versions and verify contextual rendered rich-text changes, citations and field deletion. Browser and deployment evidence follows below.

Live browser evidence for this correction: changed only the demonstration neurofeedback draft phrase from “мозговой активности” to “активности мозга”, saved it as revision 7, viewed the full-document colored diff with word-level highlighting and the source citation intact, selected revision 6 for restoration directly into the article, and saved the original text as revision 8. Publication remained revision 5. No public sample definition was changed. The contextual toolbar was changed to a floating overlay after browser review exposed layout movement on blur. The final screenshot and final deployment ID are recorded below.

Final deployed version for the interaction correction: `08acd1ab-d6fa-4287-ab09-218417460d0f`. Final browser review verified the floating toolbar leaves the paragraph document position unchanged (less than 0.001 px rounding difference), history 7 → 8 shows red/green line pairs and word highlights, unchanged article context and citations remain readable, and no console warnings/errors were observed. Narrow viewport review showed no horizontal overflow, then reset the override. Screenshots: docs/inline-editor.jpg and docs/article-diff.jpg. The signed-in browser remains on the actual article history.

## Autosave, topic creation and contextual search — 9 October 2026

The user accepted in-article editing/document diffs and requested ordinary discourse-example typography, actual related-term search, no native browser warning dialogs, automatic saving, and article-driven topic creation. Implemented: ordinary article prose/subheadings for discourse examples; searchable concept pickers matching English labels, Russian equivalents and stored abbreviations; topic search/create inside the article; dynamic navigation from visible article assignments; serial debounced draft autosave, immediate navigation flushing and reconnect/page-hide attempts; local recovery for incomplete/offline edits; conflict protection and idempotent retries after a lost response. All native prompt/confirm/alert calls were removed, including new-article and external-link entry. Publication, schema migrations and bulk import application remain explicit.

The compatible live category enum → text migration was previewed without validation failures and applied atomically as schema version 3. Existing categories/documents were retained with recorded revisions. The initial three labels came from demonstration categories; new labels now come from author assignments. Public navigation does not expose topics found only in private drafts. Related-concept identifiers are also checked server-side, including private-public publication restrictions.

Final local checks: strict types, zero-warning lint, 22 tests / 93 assertions, Vite and real Worker dry-run build. New tests exercise overlapping autosaves with revision advancement, immediate navigation flush, conflict blocking, lost-response idempotency, and new-topic privacy/publication after a compatible migration.

Live browser checks on the private technical fixture: created “Проверка автосохранения” in the topic picker; saw it in navigation after automatic persistence; searched “электро” → electroencephalography and “нейрообратная” → neurofeedback; added the selected related term; edited a label and immediately navigated away with no dialog; reloaded and verified the saved label/category. Restored the fixture’s original category, label and related list through the same automatic flow. No public article content was edited or published. Topic URL filtering now survives direct navigation/reload, including server-rendered topic pages. Final deploy and screenshot evidence follows.

Final deployment for autosave/topics: `f783d337-0c68-490e-afd2-8c936dbf1065`. Browser verified a direct topic URL and reload maintain the selected section, and the deployed discourse section renders normal dark prose on white with ordinary subheadings. Screenshot: docs/discourse-prose.jpg. No console warnings/errors observed. Final live HTTP read checks confirmed the private fixture has its original category/equivalent/two related identifiers, exactly three public articles remain, the fixture is not exposed, and schema version 3 is active. No browser-native dialogs appeared during navigation/creation checks.

Remaining implementation: Access email login configuration/live check; CSV field mapping and a reuse-verified InterLex adapter; richer imported-baseline diff/update proposals; shared concept/episode identities where real cards require them; repository identity/GitHub CI; full backup/restore rehearsal. Real corpus import, final brand/domain and licensing require the actual materials/decisions. Optional embedded LLM and Parallel integrations remain unconnected and do not block this authoring workflow.

## Pilot preparation — active

The user authorized a public GitHub repository and automatic deployments, and requested all technically actionable preparation before real cards arrive tomorrow. Embedded OpenAI/Gemini agent chat and Parallel Search are now active scope, not deferred optional work. Prepare current-schema tools, scoped writes, sourced answers and bounded server-side calls. Live integrations require provider credentials; do not claim them from fixtures.

Deliver public repository/CI/deploy, CSV mapping and import differences, a verified external data adapter/import, backup restoration evidence, practical author access and feedback path, and the embedded agent/search integration. Preserve public read access and private drafts. Do not add development or infrastructure notes to product UI.

## Pilot preparation evidence — 9 October 2026

Public repository established: https://github.com/alexandr-panchenko/neurolex. Initial commit `1a6a22d` passed GitHub Actions. Source configuration is redacted; private local Cloudflare settings and all credentials/backups are ignored. Checked-in main deployment applies reviewed SQL migrations then deploys only after checks succeed; activation/live automatic deployment requires the requested account-restricted API token, not local OAuth copying.

Implemented CSV/TSV parsing/header mapping against current schema, human-readable import differences, explicit per-field replacement guarded by preview revisions, and duplicate/shape validation. Browser upload preview matched term/equivalent/definition and displayed the existing MeSH definition with an unchecked replacement option.

NLM MeSH descriptor/preferred-concept adapter was live-tested on Cloudflare. `magnetoencephalography` imported as a sourced private draft, carrying canonical descriptor/concept IDs, retrieved/updated metadata and NLM attribution/terms. Public articles remain exactly three. The initial Worker failure was the unsupported fetch redirect:error option; manual status checking fixed it. This is real MeSH import, not an InterLex compatibility claim.

OpenAI Responses and Gemini Interactions tool loops, Parallel v1 source search, server-only secrets, per-conversation scoped actions, idempotent chat requests, provider failure traces and bounded requests are implemented. Recorded-response tests exercise both provider loops, blocked model writes, retry reuse and source evidence. No provider key/model ID or Parallel key is configured; no live-model or live Parallel success is claimed. Author feedback submission and private owner inbox are implemented; HTTP save/read was verified.

Full live D1 backup restored in separate private SQLite on 9 October: integrity_check=ok, schema version 3, four articles and 25 revisions at the export snapshot. All article/revision JSON parsed; operational tables and credential hashes restored privately. This is a local full-export recovery rehearsal, not remote cutover or scheduled backup.

Final local pilot checks: 31 tests / 125 assertions, strict TypeScript, zero-warning ESLint, Vite and actual Worker dry run passed. Remaining external dependencies: Cloudflare deployment/Access API token and Access configuration/live OTP; selected provider keys plus explicit model IDs; Parallel key. Real cards arrive tomorrow and do not block the delivered preparation. Live automatic deployment and provider calls must be verified after provisioning.

Final pilot deployment: `49babdc8-048b-48e6-aa56-615b042582d4`. Provider fixture tests also verify actual shared-domain draft writes, unchanged public publication, and embedded-agent revision provenance. Pending credentials are explicit above.

Post-import backup restoration also passed: five articles, 26 revisions and one private feedback record; schema version 3 and integrity_check=ok. Browser directly opened the private imported article, displayed the English scope note, author-supplied Russian equivalent and actual MeSH source/terms. Screenshot: docs/mesh-import.jpg.

## Standards audit and original NeuroLex import — 9 October 2026

Reviewed OntoLex/Lexicog primary specifications; documented the implemented profile and concrete extension boundaries in docs/SEMANTIC-PROFILE.md. Corrected English imported rich-text language, xsd:date output/SHACL alignment and explicit one-owner/one-reference lexical senses. Existing discourse examples additionally export via lexicog:UsageExample/rdf:value and matching language-specific sense links. Original source correspondence exports as seeAlso/wasDerivedFrom rather than inferred exactMatch.

Added authenticated NeuroLex/InterLex proposal endpoint and browser source selection. Official public SciCrunch NIF-Ontology investigation module and NIFSTD-ILX mappings are pinned to commit e0b6941924a5dabcd62c5cab879e9b8c64571e4a, with CC BY 4.0 repository attribution and retained original citations. Live Cloudflare retrieval by ilx_0107518 resolved nlx_inv_090919, Tract tracing assay; preview/apply produced private draft neurolex-nlx-inv-090919 with unchanged English definition, external IDs, source annotations and importer-supplied Russian equivalent. Public article count remains three. Corrected only the prior MeSH draft language metadata via a normal recorded revision.

35 tests / 144 assertions, types, lint and Worker build passed. Test deployment: 0bd8c1a5-39a6-4b4c-a0c8-bdff63766c10. This is a targeted historic NeuroLex/NIFSTD module import with explicit InterLex mappings, not a complete/current InterLex database or full original field-model reproduction.

Final adapter deployment with concise source attribution: 79128a0f-1057-4f30-99f8-32b4877dbb48. Live JSON-LD/Turtle equality and SHACL passed for all three published articles. Browser verified InterLex lookup, existing-record preview, imported English editor language and the persisted private article; screenshot docs/neurolex-import.jpg. No source definition was fabricated or publicly published.

## Accessible user guide — 9 October 2026

Added a public Russian `/help` page with fifteen task-oriented sections, a compact contents disclosure, direct section anchors, quick links, a CSV example and links to integration/semantic documentation. It covers first-card entry, field meanings, autosave/recovery, topics and inline links, publication/history, CSV/JSON/external imports, global schema, assistant permissions, external agents and feedback. Help is rendered as readable HTML without JavaScript or authentication, with responsive editorial typography and a keyboard skip link. A visible header link opens help separately so an article editor stays open.

English repository instructions are generated as docs/USER-GUIDE.md from the same bilingual src/content/help.ts content. The standard check fails if the generated copy is out of date. README links both entry points. No development/infrastructure notices were added to the product. Local checks: 35 tests / 144 assertions, types, zero-warning lint, documentation consistency and real Worker build passed. Deployment/browser/CI evidence follows.

User-guide deployment: fea85534-b65d-4c09-a2f1-efda03f52bd3. Browser verified all fifteen sections, expandable contents, quick-link navigation and valid internal anchors. Narrow viewport 390 (375 px content area) had no horizontal overflow, including the CSV section; temporary viewport reset. Screenshot: docs/user-guide.jpg. The guide is public and independent of author sign-in/provider configuration.

## Author workflow clarification — 10 October 2026

User feedback exposed unclear configuration surfaces. Replaced the tall global schema cards with a compact editable table, field move controls, nested-group editing and writable description/predicate/target semantics. Fixed lexical identity mappings are visibly constrained rather than accepting ignored edits. Group children inherit their group target. Preview/apply and migration history remain authoritative; no arbitrary field reorder was applied to live data.

Made external imports visible, with source-browser links and identifier guidance. Added current-schema CSV/JSON template downloads and a step-by-step file workflow. Renamed the owner inbox to “Отзывы пользователей”, distinguishing it from the submission form and explaining private visibility. Agent access explains the shared MCP/Bearer protocol, permission scope and distinction from a model API key. An unconfigured assistant shows a connection explanation rather than a nonfunctional chat form.

The user selected OpenAI GPT-6 Luna, API ID gpt-6-luna verified in primary OpenAI Docs; .env.example and OPERATIONS.md record it. The user will provide the key later via a private file path. No provider call or account entitlement is claimed. Local checks: 35 tests / 144 assertions, types, lint, synchronized documentation and actual Worker build passed. Final UI-only constraints passed types/lint/build again. Live deployment and interface evidence follows.

Final verification: full check passed (36 tests, 146 assertions, typecheck, lint, guide consistency, client build and Worker dry run). Live schema table moved definition below analysis and restored it without applying a global migration; screenshot: docs/schema-table.jpg. Authenticated CSV/JSON template downloads and JSON import preview passed against the test deployment without creating records. Final test Worker version: 9292852d-61b6-4d08-b764-db8bdb1ab356. OpenAI and Parallel live calls remain pending service keys.

## Personal author invitations and supplied provider credentials — 10 October 2026

Explicitly ignored .env.local (also covered by .env.*), checked it is untracked and restricted its file permissions. Provisioned only the selected OpenAI key/model/provider into Worker secrets without printing values. Gemini remains unconfigured without a selected model; Parallel and CI API token are absent. Live OpenAI model lookup succeeded and, after explicit consent to send the schema, the deployed assistant called schema_get and returned version 3; no document was read or changed.

Added separate human-author invitation kind in the owner access screen. Read/write and optional publication are available; schema/credential administration is withheld. Personal browser login uses the revocable invitation with an eight-hour cookie; logout retains the invitation for re-entry. Invitations expire after 30 days. Email/name is a label, not mailbox verification or self-service registration. All drafts are shared with read permission. Tests cover draft writes, denied publication/schema/credential access, logout/re-entry and immediate revocation. Full check passed: 37 tests, 160 assertions, types, lint, guide consistency and Worker build. Live invitation issuance verification requires separately requested authorization after automatic approval review rejected the test access grant.
