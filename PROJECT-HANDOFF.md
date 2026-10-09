# NeuroLex — project handoff

Prepared 9 October 2026 from the product design conversation. This document records intended behavior and selected directions; no application or live infrastructure was implemented in that conversation.

## Purpose and working name

Build a complete small digital lexicographic platform for a dissertation on neurotechnology terminology. The researcher has an initial collection of approximately 20–25 terms and expects to grow it to 100 or more. Existing source cards have not been supplied to the implementation agent. Prepare representative sample content independently and support later import of the real collection.

The product is a specialized wiki: each dictionary article is a readable document with structured, machine-readable information. It combines English terms and Russian equivalents, lexical definitions, definitions or explanations found in podcast discourse, linguistic characteristics, sources, usage examples, and researcher analysis. Its value includes both the collection itself and comparing how terminology is used across contexts.

NeuroLex is a working project label, not a cleared public brand. An existing neuroscience resource has that name and its terms are accessible through InterLex. Candidate names discussed include NeuroContext, NeuroTerms, NeuroDiscourse, NeuroVoc, and CortexLex. None was selected or checked for availability. Keep branding configurable; do not make renaming a prerequisite for development.

This is a dissertation resource with public reading and a small authorized authoring surface. No paid subscriptions, customer accounts, or monetization system are requested.

## Product principles

- Use existing standards and external identifiers wherever their semantics fit.
- Make data easy to read, search, import, export, extend, and modify through both a browser and agent tools.
- Treat the article schema as versioned project data rather than a fixed collection of fields scattered through UI code and prompts.
- Keep one authoritative domain model and operation layer behind the browser, HTTP API, and MCP.
- Preserve source provenance, article history, schema history, and author contributions during imports and migrations.
- Keep publication distinct from drafts and generated proposals.
- A useful application must work with an external agent and without an embedded LLM subscription.
- Optimize for one author and their agents. Simultaneous character-level collaboration is not required.

## Users and permissions

Visitors, search crawlers, and unauthenticated agents can read published articles, search, follow relationships, inspect the public schema, and retrieve published exports. Drafts and private editorial metadata are not exposed through public search, RDF, caches, or exports.

An explicitly permitted user can create and edit articles and the schema. An agent may perform these operations under credentials delegated by that author. Treat anonymous writing as out of scope: the conversation's final clarification was public reading and authorized modification. Logging in with an arbitrary account must not grant editing rights.

Use the same wiki UI for visitors and the author. Authorized users gain create, edit, import, history, and schema-management actions; do not build a separate dashboard as the principal workspace. Record the actor and origin of changes, including agent and import activity. An authorized agent can publish when its assigned permissions allow it; human confirmation is not required for every agent write by default.

For the single-author deployment, investigate Cloudflare Access with a permitted email and one-time code, or Google login if more practical in the existing setup. Resend is unnecessary if the selected authentication service already delivers the code. Authenticate headless agents separately with revocable credentials. Confirm the target MCP client's authentication support; service-token headers are not universally supported by MCP clients. Use a standards-compatible auth route or the documented HTTP API where appropriate. Keep authoring protection separate from public access and validate authentication at the Worker boundary.

## User experience and scenarios

The primary metaphor is Wikipedia with good search. Use a readable article column, clear section headings, a small search/navigation area, unobtrusive source citations, and useful related-term links. The conversation did not approve a visual reference. Choose a restrained, accessible editorial baseline and present it for review. Avoid a chatbot-first layout and equally weighted dashboard panels.

Use Russian author-facing UI as an initial assumption, with English terms and Russian equivalents naturally coexisting. Make UI strings localizable; final language can be adjusted during review. Repository-facing documents stay English. Support comfortable desktop editing and responsive reading on narrow screens.

### Find and understand a term

A visitor searches an English term, Russian equivalent, abbreviation, or relevant phrase. The results show recognizable names and concise context. Matching should prioritize exact terms, equivalents and abbreviations, then relevant content. Support filtering where actual data justifies it. A natural-language query must not require a paid model merely to return search results. Show a useful empty result state.

Opening a result displays a persistent article URL with definitions, linguistic analysis, usage examples, evidence, and related concepts. The reader can distinguish a quotation, an imported definition, the researcher's interpretation, and AI-generated explanation.

### Create or edit an article

The permitted author chooses Create or Edit on the same site. They edit text in context, change structured fields using appropriate controls, attach sources, save a draft, review changes, and publish. Show validation messages near the affected content. A saved change produces a revision; recover previous content without erasing history. Preserve unfinished edits during a recoverable request failure.

Use ProseMirror for rich text, including paragraphs, headings where appropriate, lists, links, quotations, and source references. Structured values such as language, category, relationship, timestamp, and external identifier remain typed domain values. The UI may combine these inside a document-like layout. Do not require all domain data to become an opaque ProseMirror tree.

### Import or research a term

The author starts from a local file, a known external record, or a research request. The system previews mappings, proposed field values, evidence, and duplicates. Imports and generated content become drafts unless the authorized caller explicitly requests permitted publication. Missing evidence stays missing rather than being invented.

Parallel and existing terminology services can help find sources. Integrate them incrementally; lack of credentials must not block manual imports or external-agent submission of sourced drafts.

### Extend the article schema

The author adds a field, specifies its type and display properties, and sees it in the editor and public article when populated. Example: add an optional repeated field describing discourse functions. An external agent can perform the equivalent operation through the same domain layer.

For a breaking change, show the proposed schema, affected records, validation failures, and migration preview. Apply the approved schema and document transformation consistently, retaining the earlier revisions. A failed migration must not leave half the dictionary on an incompatible schema.

## Domain and document format

Use JSON-LD as the portable semantic document representation. Prefer a document per article, stable identifiers, a versioned JSON-LD context, and explicit schema versions. A separate concept can be referenced by multiple lexical entries or articles. Nested structures are allowed, but reusable entities need identifiers that survive movement and display-name changes.

Distinguish:

- A concept, such as the technology represented by BCI.
- A language-specific lexical entry and its forms.
- A lexical sense connecting an entry to the intended concept.
- Abbreviations and their relationships to full expressions.
- A lexicographic article organizing the presentation.
- Definitions with source and editorial status.
- Sources, podcast episodes, and attested usage excerpts.
- Researcher annotations concerning definitions or excerpts.

Different wording in a podcast is not automatically a new lexical sense. It can be simplification, metaphor, explanatory paraphrase, or inaccurate usage; let the researcher classify it.

A usage example can include episode title, series, speakers where known, URL, language, excerpt, start/end timestamps where supported, transcript provenance, and researcher commentary. Distinguish a speaker's explicit definition from a meaning reconstructed by the researcher. Never invent a source URL, quote, speaker, or timestamp to complete a card.

Rich text requires an explicit serialization strategy and tested mapping to public HTML and RDF-compatible values. ProseMirror JSON is an editor representation, not automatically an interoperable lexical model. Preserve supported formatting and semantic source references across browser edits and agent round trips. Avoid independently editable duplicate representations of the same text.

## Standards and interoperability

Use OntoLex-Lemon for lexical entries, forms, senses and references; Lexicog for lexicographic organization; appropriate existing vocabularies for concept relations, provenance and metadata. Use SKOS where concept-level semantics fit, and RDFS/OWL where genuinely needed. Publish a small project vocabulary for research-specific properties rather than misusing approximately similar standard properties. OntoLex-Lemon and Lexicog are community specifications, not W3C Recommendations.

Publish machine-readable vocabulary/context definitions and document the supported profile. JSON Schema validates document shape; JSON-LD supplies semantic mappings; SHACL verifies graph constraints. Keep these consistent through a constrained field-definition model and meaningful validation tests. Do not promise automatic translation of every arbitrary JSON Schema feature into SHACL, or treat OWL reasoning as validation.

Create actual JSON-LD and Turtle exports with parser-tested semantics, not a nominal RDF label on ordinary JSON. External mappings must distinguish exact identity, close match, and related concepts. Do not infer equivalence solely from matching labels. A public SPARQL service and a dedicated triple store are not required for the first release.

Support lossless export/import of the application's own documented format. Include schema/context versions and enough metadata to understand a standalone export. Provide tabular import with field mapping where useful for the researcher's original collection. Implement targeted external adapters beginning with a small verified InterLex import if its live interface and reuse conditions permit it. Preserve external IDs, provenance, licenses and attribution. An RDF parser alone is not an import mapping for arbitrary external ontologies.

Preview duplicates and re-import differences. Preserve author additions and modified fields instead of overwriting entire cards. External systems need not accept uploads back to them; standards-based export is still required.

## Evolving schemas and migrations

Treat the domain schema, editor field configuration, semantic mapping and their versions as persistent application data with a coherent lifecycle. Define a practical supported set of field types: plain text, rich text, multilingual values, numbers, booleans, dates, enumerations, references, repeatable groups and nested objects as justified by the initial cards.

New optional fields normally require no data rewrite. Label and presentation changes must not change identity. Renames, type changes, required-field changes and removals need impact analysis and explicit migration behavior. Preserve prior values in history. Allow extensions to survive import/export round trips instead of silently dropping unfamiliar properties.

Migrations must have preview, validation, a recorded result, recovery behavior, and protection against concurrent writes. Use declarative transformations or trusted implementation code; do not execute arbitrary uploaded migration JavaScript in the public Worker. If a requested transformation exceeds supported operations, return a concrete requirement rather than pretending it succeeded.

## Shared operations and concurrency

Expose domain operations for searching and reading articles, obtaining the current schema, creating and updating drafts, validating, publishing, reading history, importing, exporting, proposing schema changes, previewing migrations and applying authorized migrations. HTTP and MCP are adapters over these operations, not independent implementations.

Mutation requests carry the expected article revision and applicable schema version. If either is stale, return a structured conflict including current version information. Agents fetch current state, re-evaluate the change, and retry deliberately. Do not silently replace concurrent human changes. Bulk writes and retries need explicit outcomes and idempotency where duplicate execution could create duplicate records.

Do not introduce ML Colab Codec, OT, CRDT, shared cursors, or real-time co-editing in this implementation. The user has such a library, but current needs are satisfied by optimistic concurrency and schema migration coordination. Reconsider only if actual simultaneous editing becomes a requirement.

## Agent and AI behavior

External-agent access is a core delivery route, not a later add-on. An external agent must be able to discover the active schema and allowed operations, read evidence, create a valid draft, edit it, and extend the schema under delegated permissions. Provide a concise integration guide with real examples and structured error responses.

Never hardcode the initial card fields in prompts, tool payload schemas, importer mappings or model response processing. At the start of a task retrieve the current schema/version, field descriptions, allowed values and relevant semantic mappings. Construct provider-compatible structured-output constraints from the supported current schema. Keep a generic document-write envelope where necessary and validate authoritative semantics server-side. Generated output must carry the schema version it targets. Handle schema drift before committing. A provider's limited JSON Schema subset must not become the authoritative domain schema.

The website's embedded assistant and research automation may use Gemini or OpenAI when the user supplies credentials. Neither provider nor model is selected yet. Put a small provider boundary around calls; do not build a large framework. Keep keys server-side and configure model IDs, limits and budgets explicitly. Without keys, retain working search, editing, import/export and external-agent access; do not pretend an embedded model is connected.

Ground reader-facing AI answers in published project records and cite the actual records and source excerpts. Say when information is absent. Use tools to search and inspect the small corpus; embeddings/vector infrastructure are optional and should be justified by retrieval evidence. Keep unrestricted external research distinct from answers claimed to come from the project database. Imported web text is untrusted evidence, not operational instructions.

Research automation can search through Parallel, retrieve relevant pages/transcripts, and propose values with field-level evidence. Validate proposed cards against the current schema. Treat sources as claims to assess rather than automatically verified truth. Test retrieval on actual podcast material before promising transcripts or timestamps. A full transcription pipeline is not required by the current scope.

## Persistence and Cloudflare deployment

Selected stack: TypeScript, React, ProseMirror, Hono, Cloudflare Workers; Bun for package management and suitable development/test/build tasks. Vite is the methodology's default frontend tooling. Production runs in the Workers runtime, not Bun. Verify current library and platform compatibility in the target environment.

The user normally develops on Arch Linux and reports Cloudflare tooling is already installed/configured. Inspect the existing project and available account connection first. If authentication is absent, request the required interactive login after doing useful independent work. Do not ask the user to paste credentials into repository files or chat logs.

Artifacts is optional. The user's reason for trying it is practical interest, not a product requirement. Check actual account availability and current API behavior. Run a bounded experiment covering document read/write, revision conflict, grouped schema/document update and publication/index refresh. If available and appropriate, use it as the canonical versioned tree for documents and schema. Avoid a second independently authoritative document/history store.

If unavailable or unsuitable, proceed with simple Cloudflare persistence, preferably D1 storing JSON documents and revision records, with appropriate atomicity and a rebuildable search index. Use R2 only where actual files or assets justify it. Do not wait for Artifacts access or build a general multi-backend framework. A small persistence boundary is enough.

If Git storage is selected, writes and publication still pass semantic validation. Do not equate successful Git merge with a valid article migration. Do not give direct agent Git writes a path that bypasses publication rules. Group meaningful revisions rather than committing every keystroke. Coordinate published corpus version and index version so search and reader pages do not expose inconsistent content.

Authentication, search, rendering, schema validation, migration semantics and source integrity remain application responsibilities regardless of storage backend. Keep document export portable between storage choices.

## Public discoverability

Render published article content as HTML available without client-side execution or login. Use stable canonical URLs, page titles/descriptions, sitemap, crawlable navigation and related-term links. Publish Schema.org DefinedTerm/DefinedTermSet metadata and a Dataset description for the corpus; include author, version, license and sources where known. Do not invent a license for third-party content or assume the dissertation corpus may be republished without checking.

Provide versioned JSON-LD/Turtle downloads and resolvable semantic identifiers. Document the read API and MCP endpoint on an integration page. MCP makes an already connected resource usable; it is not automatic search-engine or agent discovery. Do not promise indexing or rankings merely because metadata exists.

## Representative content

Prepare at least these three complete illustrative cards for UI development:

| Entry | Russian equivalent | Useful differences to demonstrate |
|---|---|---|
| brain–computer interface (BCI) | интерфейс мозг–компьютер | Multiword term, abbreviation, related technologies, bilingual labels |
| electroencephalography (EEG) | электроэнцефалография | Method versus its measurement/output; clarify abbreviation ambiguity where the source uses it differently |
| neurofeedback | нейрообратная связь | Compound formation, researcher commentary, relationship to EEG-based practices without asserting all neurofeedback uses EEG |

These are authoring briefs, not final scholarly definitions. Find and cite reliable source definitions during implementation, paraphrase appropriately, and preserve provenance. For demonstration podcast content use either verified excerpts or prominently labeled synthetic teaching examples. Do not publish synthetic examples as attested corpus data. Show realistic empty optional fields, multiple sources, multilingual content and long paragraphs. The agent owns preparing these examples; do not block on the user supplying original cards.

## Delivery and verification

Start with repository inspection, project documentation, working development commands and baseline checks. Use the supplied methodology in the current-step manner. Establish strict type checking, relevant linting, domain tests and a real Worker build. Follow existing repository rules for commits, pushes and deployment; avoid a mandatory PR ceremony unless required. User authentication handoffs are allowed when necessary; routine reversible implementation should continue autonomously.

Produce a wiki-style interactive UI and obtain the methodology's concrete experience review before extensive dependent UI work. The user has delegated implementation, not endless discovery. Independent backend work can continue. Keep project scope separate from this review point and proceed through the implementation plan toward the complete small application.

Meaningful acceptance checks include:

- Public search finds English terms, Russian equivalents and abbreviations; published HTML is readable without JavaScript.
- An unauthorized visitor cannot modify data or see private drafts through any supported surface.
- The permitted author edits text and structured fields, saves, publishes, views history and recovers content.
- An authenticated external agent reads the actual schema and creates/updates a valid card through real API/MCP operations.
- Adding an optional field makes it usable by editor, agent, validation and export without editing a hardcoded prompt.
- A schema change between generation and save produces a schema conflict rather than data loss or silent acceptance.
- An agent and human updating the same revision produce a detectable conflict.
- Migration preview exposes failures; an interrupted or failed apply leaves a recoverable consistent corpus.
- JSON-LD and Turtle parse successfully; supported semantic assertions survive export/import.
- Re-import preserves local author additions, external IDs and provenance.
- Rich-text edit and agent round trips preserve supported structure and citations.
- AI answers, if connected, cite actual project evidence and acknowledge missing information. Missing credentials are reported accurately.
- Search/index state tracks the published revision and can be rebuilt.

Use focused tests for consequential boundaries, browser review for the actual reading/editing flow, and bounded live checks for integrations. Do not confuse fixtures with verified external behavior. At delivery provide a runnable URL or local command, a short walkthrough, test results and exact remaining limitations. Update the handoff and plan as decisions become implemented and verified.

## Remaining environment-dependent choices

Inspect the target repository rather than guessing its identity or creating an unrelated remote. Determine the selected Cloudflare account, existing bindings and permissions, and whether Artifacts is available. Confirm the author identity during auth setup. Gemini/OpenAI and Parallel keys are optional user-supplied dependencies; do not require them for the core release. Final branding, domain, corpus licensing and public production publication must follow user instructions. No monetary limits or unconditional authorization for new paid services were established in this conversation.

## Reference documentation

These references informed design; recheck current implementation documentation when integrating. No live platform compatibility was established by reading them.

- OntoLex-Lemon: https://www.w3.org/2016/04/ontolex/
- Lexicog: https://www.w3.org/2019/09/lexicog/
- JSON-LD: https://www.w3.org/TR/json-ld/
- RDF Primer: https://www.w3.org/TR/rdf-primer/
- SHACL: https://www.w3.org/TR/shacl/
- InterLex: https://docs.scicrunch.io/terminology-services/interlex
- ProseMirror: https://prosemirror.net/docs/guide/
- Hono on Workers: https://hono.dev/docs/getting-started/cloudflare-workers
- Artifacts: https://developers.cloudflare.com/artifacts/
- Cloudflare Access: https://developers.cloudflare.com/cloudflare-one/
- Schema.org: https://schema.org/DefinedTerm and https://schema.org/DefinedTermSet
- Dataset discoverability: https://developers.google.com/search/docs/appearance/structured-data/dataset
- Parallel: https://docs.parallel.ai/introduction

## Implementation evidence — 9 October 2026

The user accepted the restrained visual style and requested real functionality. The preview now uses D1 persistence, authorized author-key sessions, revocable scoped agents, public-only SSR/search/exports, in-place article editing, revisions, recovery, global schema preview/apply and JSON import. HTTP and MCP share validated optimistic operations. An actual MCP optional-field migration produced schema version 2, and the new discourse-functions field was filled and saved in the browser. JSON-LD/Turtle graph equivalence and generated SHACL were tested. Details, verification boundaries and remaining work are in IMPLEMENTATION-PLAN.md and docs/.

The author email was explicitly confirmed as the confirmed author email. Cloudflare Access email-code login is implemented but configuration is pending; personal owner-key login is live. This is a test site, not a production dissertation publication. Artifacts was live-probed and cleaned up; D1 was selected for practical Worker writes. GitHub access is verified, but no repository identity or remote is established.

The subsequent user correction requires direct editing in the readable article and rendered document history diffs. Implemented and deployed: one article layout with contextual rich-text controls and editable title/values; revision selection renders unchanged context alongside red removed/green added paragraph pairs and stronger changed-word highlights. Actual draft save, comparison and restoration were browser-tested. See the current plan for evidence.

The next accepted correction adds draft autosave without native warnings, real concept search, author-created article topics, and ordinary discourse-example typography. Category schema version 3 was migrated through preview/apply. Publication remains explicit; invalid/offline edits stay locally recoverable and version conflicts are not silently overwritten. The current plan records actual private-fixture browser checks and remaining integrations.
