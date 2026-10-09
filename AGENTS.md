# Working instructions

Read `START-HERE.md`, `PROJECT-HANDOFF.md`, and `IMPLEMENTATION-PLAN.md`. Use `methodology/start-or-resume.md` to select only the guidance relevant to the active step.

Communicate with the user in Russian. Write repository documentation and commit messages in English. Preserve the supplied methodology.

The selected stack is TypeScript, React, ProseMirror, Hono, Vite, Bun tooling, and Cloudflare Workers. Dependencies are installed with `bun install --frozen-lockfile`. Wrangler 4.149.0 is pinned locally. It requires Node >=22; this machine's default nvm Node 20 is insufficient, but `/usr/bin/node` is v25.9.0. `env PATH=/usr/bin:$PATH bunx wrangler --version` was verified. Run `env PATH=/usr/bin:$PATH bun run cf:login` in the user's external terminal for browser authentication, then `env PATH=/usr/bin:$PATH bun run cf:whoami`. Verified commands: `bun run typecheck`, `bun run lint`, `bun run test`, and `bun run build`; `bun run check` combines them. Prefix commands with `env PATH=/usr/bin:$PATH` on this host. Use `WRANGLER_LOG_PATH=/tmp/neurolex-wrangler.log` for sandboxed dry runs. `bun run dev` serves the UI development server; `bun run preview` serves the Worker locally. The theme entry point and UI rules are in `DESIGN.md` and `src/ui/theme.css`.

Keep schema, validation, publication, history, and optimistic concurrency in a shared domain layer used by browser, HTTP, and MCP. Discover the active schema for agent operations. Public surfaces must expose published content only. Never invent source evidence or print credentials.

Use the accepted restrained wiki baseline. The user reviewed the mock and authorized implementation; do not repeat a mock-only review or introduce demo author mode. Read README.md and docs/INTEGRATION.md for the real working paths.

Use trunk-based development and coherent commits after applicable checks pass once repository identity is established. Do not invent a remote, overwrite existing work, bypass branch protection, or impose a PR ceremony. Local implementation, test deployments, the public GitHub repository and main-branch automatic test deployments are authorized. The user requested all technically actionable pilot preparation, including embedded OpenAI/Gemini chat and Parallel. Production domain and new paid services have not been authorized.

Cloudflare OAuth authentication was live-verified on 9 October 2026 for the account configured in wrangler.jsonc. Existing tooling was inspected; do not treat stored configuration as verified access. Artifacts is optional; unavailable access must not block a D1 implementation.

Never add development status, demonstration notices, working-name disclaimers, infrastructure/storage notes, or editorial reminders to product UI. Report implementation status and limitations in chat and repository documentation. Article evidence labels and functional editing feedback belong to the content and workflow.

Public wrangler.jsonc is a redacted template. Use ignored .wrangler.local.jsonc via bun scripts/deploy.ts for actual deployment/migrations. Never publish private backups or transfer local Wrangler OAuth tokens to GitHub. Provider and CI secrets must come from explicitly supplied private credential files.
