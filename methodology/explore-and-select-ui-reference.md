# Explore and Select a UI Reference

**Where this happens:** with the human in an image-generation chat, a UI design tool such as Stitch or Claude Design, a visual editor such as Figma, or an existing interface. Verify which tools and exports are actually available.

**What it produces:** selected visual references or a rough interactive design export, with enough context for an agent to build the real UI. The export is design material, not automatically an accepted production codebase.

Start from the [project handoff](design-project-and-write-handoff.md). [Repository preparation](prepare-repository-for-agents.md) can proceed independently from that handoff. Before building real components, both the design direction and the repository checks must be ready enough for that work.

## Establish what the visual tool is being asked to decide

Provide the intended scenario, interaction model, realistic content, main action, attention hierarchy, and relevant constraints. Say what occupies the workspace, how the human acts, and how the agent participates. Do not give only a feature list and leave the tool to choose a dashboard by default.

Distinguish interaction from appearance. A document with contextual tools can be visually minimal or resemble a physical notebook. Paper, leather, and rounded corners are visual choices; paging, editing, and preserving selection are interaction choices.

If the interaction itself is unclear, compare short descriptions or rough prototypes of that scenario before polishing whole screens. Return new decisions to the project handoff. Conceptual design and visual evidence can inform each other; the tool must not silently redefine the product.

State what each source governs: an image may define appearance, a prototype may demonstrate behavior, and the existing repository may impose integration constraints. The latest code is not automatically the best visual reference. If several exports exist, choose their roles rather than silently mixing them.

## Explore, select, and refine

When a new direction is needed, generate several genuinely different visual treatments within the chosen interaction model. Select one, then refine it. Avoid indefinitely combining incompatible ideas from different candidates.

For image generation, begin with one complete representative screen so the composition is visible. Request subsequent changes locally and state what must remain unchanged. Add states when they reveal a new rule: a closed and open object, an empty and populated chat, selection, or a relevant error. Do not generate every conceivable screen before learning from the first one.

For structured design tools, keep useful layout and design information alongside the rendered reference. Do not discard explicit values merely to infer them again from pixels. Figma is an option, not a mandatory intermediate step.

A rough HTML export may help the human explore navigation or composition. Its code structure, libraries, and styling conventions are not automatically the product's implementation choices. Preserve a successful experience while allowing the repository agent to rebuild unsuitable code.

Use plausible text, photographs, media placeholders, and long content where relevant. A design that works only with tiny labels is not evidence about the actual product. Do not treat fixed screenshots as a complete responsive specification.

## Review the design with the human

Review the imagined or rough scenario, not only visual attractiveness: what is the user attending to, what can they do, what changes, and what stays understandable afterward?

An attractive image can contain contradictory states, inaccessible controls, incorrect text, or impossible geometry. **Selecting its appearance does not approve all depicted behavior.** Clarify important discrepancies and update the project decisions. Do not silently copy a defect or replace the accepted visual direction under the pretext of making it practical.

This is a natural participation point: seeing the result may change the human's understanding of the product. That is design work, not necessarily a failure of the original specification. Stop dependent UI implementation at an agreed selection point; independent repository preparation can continue within its assignment.

## Pass the result to the repository

Save the accepted reference files, the represented states and viewport sizes, useful structured exports, and important constraints. Clearly distinguish accepted references from rejected exploration. Keep enough source information to revise the design; do not make every discarded image required context for the next agent.

Explain what is authoritative and what remains illustrative. A font inferred from an image is a choice unless identified from a reliable source. A hidden menu's behavior cannot be extracted from one frame. Intermediate sizes and unsupported states require design decisions, not invented precision.

Record stable interaction and visual rules in the project's concise `DESIGN.md`, or update the existing design description. Exact token values and component structure will become code during the next stage; there is no need to duplicate them in a speculative inventory now.

If a special material, illustration, motion, or object is essential, identify it and the question its implementation must answer. Detailed resource production can happen while building the corresponding component; it need not delay selecting the overall composition.

The handoff to [Build the design system and interactive mock](build-design-system-and-interactive-mock.md) consists of these accepted materials plus the relevant product decisions. It is not a request to reproduce the entire screen as a background image with invisible controls.

## When this stage can be small or skipped

A suitable existing design system may already supply the visual direction. A simple utility may need only a short statement of composition and basic visual roles. An agent-only product may instead need a reviewable output artifact. Do not manufacture a visual exploration exercise merely because this file exists.

For a substantially repurposed product, deliberately reconsider the design. Reuse existing visuals only when they fit the new task; the fact that the old UI works does not make it the right reference.
