# Refresh a Project for Redesign

**Where this happens:** first with an agent that can inspect the repository and available running product; then in a design conversation using the resulting project materials.

**Use this when:** purpose, audience, interaction, distribution, or a substantial capability is changing. Routine continuation or a local bug fix does not require restarting the full design process.

**What it produces:** a trustworthy, portable account of the existing product and reusable evidence. It supports a new design conversation without pretending the product is a greenfield project or requiring the old interaction model to survive.

## Describe the existing system as it actually is

Read project documents, inspect implementation and tests, and exercise the relevant running paths where access permits. Update stale descriptions. State what was directly checked and what is only documented, reported, or unavailable for inspection.

Explain the present purpose, users and agent clients, entry paths, important operations, artifacts and formats, UI behavior, architecture, and deployment. Include known limitations and unfinished work that matter to the proposed change.

Identify useful foundations: working runtimes, document engines, media formats, components, integrations, validation, and experiments. For evidence, retain enough configuration and output context to understand what was tested. A successful experiment for one task does not prove an expanded task automatically.

Keep current implementation separate from the proposed target. Do not rewrite descriptions of existing behavior as though the redesign had already shipped. Where possible, identify the source revision and deployed version actually inspected; do not invent identifiers when they are unknown.

## Make the context usable outside the repository

Update the existing project documents rather than creating a second competing account. Prepare enough context that the human can take the documentation folder into another chat: an understandable current-state description, key decisions, relevant experiment results, and representative artifacts or screenshots when they carry information prose cannot.

Repository paths are useful to the implementation agent but are not proof that the receiving chat can read those files. Include the necessary excerpts or files for important claims, and state which further evidence remains only in the repository. Do not export secrets or unrelated private data.

This does not require a universal inventory or a document for every category. The receiving chat needs to understand what exists, what has been learned, what can be reused, and what the human now wants to change.

## Restart product design, not necessarily the codebase

Use [Design the project and write the handoff](design-project-and-write-handoff.md) from the beginning with this factual context and the new intent. Revisit task origin, outcomes, domain, agents, human interaction, infrastructure, and distribution together. Do not skip relevant questions solely because the old version had an answer.

Expect substantial visual reconsideration when the intended interaction changes. Reuse an existing design only where it fits the new product, not as an automatic constraint. Conversely, a new purpose does not justify discarding a working technical base without a reason.

For a video-generation product, an established audiovisual representation and rendering pipeline may remain useful while creative script generation becomes a new, experimental capability. The latter needs its own evidence before downstream work relies on it.

For a template system, proven document processing may remain useful while human interaction and the adoption channel are redesigned. The new user experience does not by itself invalidate the processing engine; the existing engine does not settle the new user experience.

## Bring the new handoff back into active work

The design conversation produces the updated target, reuse/replacement decisions, unresolved questions, and next assignments. The repository agent reconciles this with changes made since the snapshot. Do not overwrite newer facts with an older exported document or treat every second-opinion suggestion as an approved decision.

Prepare or adjust the repository, select the new visual references where needed, and build the new mock before substantial dependent implementation. Preserve established checks and useful evidence; extend them for the new purpose.
