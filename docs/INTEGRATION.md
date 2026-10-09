# Agent and data integration

Base URL: https://neurolex-preview.sanocks.workers.dev. Public HTTP reads require no credential. Author-created Bearer credentials carry `read`, `write`, `publish`, and/or `schema` permissions; the author UI shows a token once. Keep it in your client's secret/header configuration, never URLs or source files. Only the owner session can create/revoke credentials.

Always GET `/api/schema` before generating a document. The response contains the current `schema`, generated `jsonSchema`, and `corpusVersion`. Field definitions include type, section, required/repeated flags, descriptions, allowed values, and RDF predicate/target. Use these definitions rather than copying the initial field list into prompts.

GET `/api/articles?q=EEG` searches published content. GET `/api/articles/:id` returns published `{id, revision, document}`. With `read` permission, `?private=1` returns the full record, including current draft and published snapshot. GET `/api/articles/:id/history` is private.

## Writes

POST `/api/write` with `Authorization: Bearer <credential>`, JSON content type and an optional `Idempotency-Key` header:

```json
{
  "schemaVersion": 2,
  "expectedRevision": 0,
  "publish": false,
  "document": {"id": "new-term", "schemaVersion": 2, "values": {}}
}
```

This illustrates the envelope only. Fill `values` according to the freshly discovered required fields; do not submit the empty example. For updates, fetch the private record and use its current `revision`. Publishing requires the separate `publish` scope. Rich text is supported ProseMirror document JSON, not HTML. Source and term marks must reference existing sources/articles; publication cannot link to an unpublished term.

Errors use `{error,message,details}` with HTTP 401/403 for auth/permissions, 422 for validation, and 409 for stale article/schema/corpus versions. Re-read and reconsider a conflicting update. Never blindly replace newer author content. An idempotency key is actor-scoped; reuse with a different payload is rejected.

## Schema changes

POST `/api/schema/preview` with `schema`, `expectedSchemaVersion`, and `transformations`. The proposed schema version must be current + 1. Transformations support declarative `rename`, `set`, and `remove` operations on field identifiers; uploaded executable code is not accepted. The preview returns validation failures and the current corpus version. POST the same proposal to `/api/schema/apply` with `expectedCorpusVersion` from the preview. One D1 transaction updates schema, records, history and corpus version, or rolls everything back. Core bilingual identity fields are constrained by the supported profile.

## Import and export

GET `/api/export` returns `neurolex-bundle` format version 1, complete schema, corpus version and published documents. Authorized `?private=1` exports current drafts. This portable format preserves supported rich-text trees and unknown value properties. It exports document state, not a full history/auth/database backup.

POST `/api/import/preview` then `/api/import/apply` with `{schemaVersion,documents,publish:false}`. Maximum 100 documents per atomic batch. The active schema must match; migrate explicitly when importing an older bundle. Existing local field values always win; previously absent fields can be added. Preview identifies duplicates and retained/incoming fields. This conservative policy does not automatically update imported baselines or merge rich-text paragraphs. Deliberate replacement uses a normal revision-checked write. Browser import accepts JSON bundles and CSV/TSV mapping against the active schema. Targeted external adapters return proposals for the same preview/apply path.

## MCP

Endpoint `/mcp`, stateless Streamable HTTP POST, JSON-RPC 2.0. Configure a Bearer header in an MCP client that supports custom authentication headers. OAuth discovery and browser-mediated MCP authorization are not implemented. This is not verified against a specific external MCP client; actual JSON-RPC tool calls were live-tested.

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"research-agent","version":"1"}}}
```

Then call `tools/list` and:

```json
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"schema_get","arguments":{}}}
```

Tools: `schema_get`, `articles_search`, `article_read`, `article_history`, `document_write`, `import_preview`, `import_apply`, `schema_preview`, `schema_apply`. Write arguments use the HTTP envelopes; pass `idempotencyKey` in arguments for retries. Tool errors use `isError:true` and structured JSON in text content. Notifications receive HTTP 202. There is no persistent session or server event stream.

## Embedded assistant, source search and import updates

POST `/api/assistant` accepts an authenticated actor, stable request `id`, up to twelve user/assistant `messages`, configured `provider`, and explicit `allowChanges`, `allowSchema`, `allowPublish` flags. These flags cannot exceed the actor's existing scopes. Tools obtain the current schema and use the same MCP/Service optimistic operations. Responses include `answer`, `provider` and actual action `trace`; provider/tool-budget failures preserve completed traces. No keys are accepted from the browser. POST `/api/sources/search` accepts `{query}` and returns attributed Parallel excerpts. Without configured keys/model IDs these operations remain unavailable; tests with recorded responses are not live-provider evidence.

Import previews now return revision numbers and field-level current/incoming differences. Explicit replacement uses `replaceFields: {articleId: [fieldId]}` plus `expectedRevisions: {articleId: revision}` in the import apply envelope. Without selected replacements, existing author values retain precedence. The server rejects stale replacements. CSV/TSV mapping is performed against the fetched schema, never fixed initial field names. POST `/api/import/mesh` obtains a canonical MeSH descriptor and preferred-concept scope note; it returns a document proposal for normal preview/apply and does not publish.

POST `/api/import/interlex` with `{id:"nlx_inv_090919",equivalent:"исследование трассировки нервных путей"}` (or explicit mapped ID `ilx_0107518`) requires write scope and returns `{record,document}`. It reads the pinned public NeuroLex/NIFSTD investigation module and official InterLex identifier mappings, not the authenticated current InterLex API. Original external identifiers and evidence remain in `values.externalRecord`, source metadata and RDF seeAlso/wasDerivedFrom links. Nothing is published by this operation. See SEMANTIC-PROFILE.md for license, version and supported boundaries.

Rich-text ProseMirror documents may specify `attrs:{language:"en"}` (BCP47-style language tag); absent/null retains the section default. The contextual editor retains this metadata. Dates export as typed xsd:date values.
