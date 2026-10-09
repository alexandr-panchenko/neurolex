# Prepare the Repository for Agents

**Where this happens:** an agent working in the target repository, with the project handoff available.

**What it produces:** a reproducible development environment, active quality checks, short project-specific `AGENTS.md`, and a usable next-work plan. It does not build the product or a speculative component library.

This work can start immediately after the [design conversation](design-project-and-write-handoff.md), before or alongside [visual exploration](explore-and-select-ui-reference.md). **The checks must operate before the agent starts writing the real tokens, components, and application mock.** Rough exports from a design tool are input material, not an exemption for product code.

## Turn chosen architecture into a usable environment

Inspect an existing repository before changing it. Locate working commands, deployed components, tests, dependencies, documentation, and existing design infrastructure. Preserve suitable foundations. Do not turn a product redesign into an unrequested stack migration.

For a new project, apply the selected stack: normally TypeScript, React, Vite, and Bun for package management and testing, with build tasks assigned to the appropriate tool. Bun is not a required production runtime. Use the runtime selected for the deployment platform.

Make installation, local launch, preview, type checking, linting, testing, and production build reproducible using actual repository commands. Establish the relevant GitHub Actions checks. Prefer package scripts shared by local work and CI instead of conflicting definitions. Verify commands rather than writing plausible instructions that nobody has run.

Identify environment variables, accounts, secrets, provider access, and deployment targets. Keep secrets out of the repository. Record a missing prerequisite as a specific dependency; determine what can proceed with explicit fixtures and what cannot be verified without access. Authentication and billing setup should happen when the chosen scenario needs them, not habitually at the end.

## Put the quality contract in place first

Enable strict type checking, the selected lint rules with the agreed warning policy, tests, and a build check for the actual target. Do not treat a running dev server as a substitute for these checks. Do not suppress diagnostics or weaken checks merely to obtain a passing result.

Configure already-selected UI rules before UI implementation. For example, a project may require reuse of its theme and primitives or restrict literal colors outside a designated theme boundary. Define the scope and legitimate exceptions; calculated geometry, SVG paths, and renderer parameters are not all palette violations. The actual tokens will be created during UI work.

Baseline code and UI checks belong here. Artifact validators, concrete behavioral tests, and agent evaluations grow alongside the functionality they validate. The harness starts early; it need not contain tests for every unimplemented feature. Expensive model evaluations need a deliberate invocation policy and resource limits.

Browser review is part of UI work. Additional visual regression, specialized linting, or perceptual comparison is selected by project risk, not mandated for every project. Use [UI verification techniques](ui-techniques/verify-ui-behavior-and-visuals.md) when choosing those checks. An external generated image is not yet a browser regression baseline.

## Write short, operational `AGENTS.md`

This file is for an agent executing work here. Include verified commands, the active work plan and decision locations, the design-system entry point, important boundaries, and the project's commit/deployment rules. Link to the relevant methodology step instead of copying the methodology.

State the working defaults concretely: English repository text; trunk-based development; frequent coherent commits after applicable checks pass; a short commit subject and a useful short body; tests and relevant documentation updated with behavior. Do not impose a PR workflow unless the repository or organization requires one. Do not bypass branch protection to force direct pushes.

State the actual permissions for push, preview deployment, production changes, resource creation, and paid experiments. A passing local check, a push, and permission to deploy to production are different things. Do not introduce repeated manual confirmation where the work is already delegated.

When agents share a checkout or contracts, define the relevant ownership and coordination. Do not commit, discard, or overwrite another agent's unfinished changes. Keep common design tokens and component contracts coherent rather than letting each agent invent a separate UI system.

## Make the next assignment resumable

Use an existing work-plan file if it already serves the purpose. Identify the next tangible result, ready work, dependencies or blockers, verification, and the next human review point. A task should describe an outcome, not merely “work on frontend.” Mark completed work and new decisions as they occur.

The first assignment will often be the real design system and interactive mock, using accepted references. Do not authorize the agent to skip that review and implement every planned feature. Later tasks can be refined after the human experiences the mock.

The repository is ready when the next agent can run it, understand the current assignment, and have violations detected from its first substantive UI change. Continue with [Build the design system and interactive mock](build-design-system-and-interactive-mock.md) when the necessary visual inputs are available.
