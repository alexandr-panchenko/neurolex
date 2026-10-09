# NeuroLex

A working bilingual lexicographic wiki at https://neurolex-preview.sanocks.workers.dev. This is a test deployment with three sourced illustrative articles, visibly synthetic discourse examples, and private author drafts. The dissertation corpus has not been imported. A sourced MeSH article has been imported as a private draft.

Public reading, search, topic browsing, inline term/source links, and server-rendered article HTML work without author login. Authoring uses the same article sections, with ProseMirror rich text, real D1 draft/publication isolation, revision history, restoration into the editor, and optimistic conflicts. The global schema editor previews and atomically applies migrations; new optional fields appear automatically. JSON bundle import preserves existing local values. HTTP and MCP share the same domain operations. Delegated agent credentials have explicit scopes, expire after 30 days and can be revoked.

## Try the working path

Search `BCI`, `EEG`, `нейрообратная связь`, or `обратная связь активность мозга`. Explore topics, open an article, and follow an inline EEG link. As the authorized author, choose **Редактировать статью**, edit any value, let the draft save automatically, reload, and inspect **История**. Navigation flushes pending valid edits without a browser warning. Editing activates inside the existing article layout; history renders a full document with red/green changed paragraphs and stronger word-level highlights. Public readers retain the previous publication until **Опубликовать черновик**. Restoration opens old content in the editor and creates a new revision when saved.

**Структура словаря** is a global author action. The deployed schema is version 3 (free article topics), with an optional repeatable discourse-functions field added through an actual MCP migration. It was filled and saved through the browser in the neurofeedback draft. Article topics are selected or created in the article’s **Раздел словаря** search; navigation includes categories of visible articles. Related-concept pickers search names, Russian equivalents and stored abbreviations. This demonstrates schema evolution rather than an extra fixed UI field.

## Authentication

The author email is `the confirmed author email`. Personal author-key login is deployed. The ignored local `.author-key` file contains the key (mode 0600); do not commit or share it. Only its SHA-256 hash is stored in the Worker secret. The current test browser is signed in. Cloudflare Access email-code login is implemented but **not configured or live-tested**: the Wrangler OAuth token did not authorize Access organization administration. See [operations](docs/OPERATIONS.md) for the remaining setup.

## Development

Requires Bun and Node >=22. On this host use `env PATH=/usr/bin:$PATH` before Bun commands; the default nvm Node 20 cannot run Wrangler.

```sh
bun install --frozen-lockfile
bun run check
bunx wrangler d1 migrations apply neurolex-preview-data --local
bun run preview
```

`check` runs strict TypeScript, zero-warning ESLint, meaningful domain/HTTP/semantic tests, Vite build and a Worker dry run. `preview` serves the Worker with local D1 and built assets. Local secure cookies require an HTTPS local preview for browser author login. `dev` is the Vite UI server; its API must be supplied by the Worker. `cf:login` is user-operated in an external terminal/browser. `deploy:preview` checks and deploys the test site; remote migrations are applied separately.

See [integration](docs/INTEGRATION.md), [semantic profile](docs/SEMANTIC-PROFILE.md), [operations](docs/OPERATIONS.md), and [current plan](IMPLEMENTATION-PLAN.md). Embedded OpenAI/Gemini tool-using chat and Parallel Search are implemented with bounded server-side calls; live provider keys/model IDs are not yet configured. External-agent HTTP/MCP use requires no LLM key in this application.

Article drafts autosave after a short pause and flush on navigation, reconnect and page hide. Only valid documents reach the server; incomplete/failed edits retain a local copy. Server conflicts stop automatic replacement and show an inline message. A local copy from a different base revision requires an explicit inline recovery action, not a browser confirmation. Publication and schema/import application remain explicit operations. Native alert/confirm/prompt dialogs are absent from the UI.

## Pilot preparation

Public repository: https://github.com/alexandr-panchenko/neurolex. GitHub checks run on pushes and pull requests. Automatic main deployments have a checked-in workflow and await the private deployment token; see operations for setup and verified status. Public Cloudflare configuration is a template; actual local settings remain in ignored `.wrangler.local.jsonc`. Use `bun scripts/deploy.ts` for the authorized test deployment.

The author can map CSV columns, preview new and existing articles, select individual replacement fields, retrieve MeSH articles with attribution, and send contextual feedback. The owner reads feedback in the same wiki UI. `bun run backup` exports private D1 and verifies restoration separately. Provider secrets are provisioned with `scripts/configure-services.py`; `.env.example` lists the supported settings.
