# Agent Client Application Design — Start or Resume

This personal methodology organizes work between a design conversation, visual tools, and agents working in a repository. Applications serve people and agents; development agents help build those applications. These are different roles.

This directory is the complete, self-contained handout: this entry document, eight core documents, and three optional UI technique guides. Copy the whole directory into the repository; no earlier handout files are required. The tables below list every document.

**Read the current work step, not the entire package.** Project documents record the current product and evidence. An assignment identifies the next result and the relevant methodology step. None of these should duplicate the other two.

## The actual workflow

```text
New project                         Substantial product change
Idea + relevant materials           Refresh the actual project context
          │                                      │
          └──────────────────┬───────────────────┘
                             ▼
Discuss the whole project, investigate, review questions, choose decisions
                             │
                             ▼
                      PROJECT HANDOFF
                             │
             ┌───────────────┴────────────────┐
             ▼                                ▼
    Visual exploration               Repository preparation
             │                                │
     Selected references             Working repo + checks
     or rough UI export              + project AGENTS.md
             │                                │
             └───────────────┬────────────────┘
                             ▼
   Real design system + interactive mock with mock data
                             │
                    Review the experience
                             │
                             ▼
    Useful vertical slice, or the entire small application
                             │
                    Use the real result
                             │
                  Improve and repeat ◄────────────┐
                             │                   │
                             ▼                   │
                Launch, integrate, distribute ───┘
```

Visual exploration and repository preparation both consume the project handoff. Either may happen first; they can proceed independently. **Both must supply what is needed before the agent builds real UI components.** Baseline checks are not postponed until the product implementation stage.

Research and experiments branch from whichever decision needs them and return evidence to that decision. A mock, a processed document, or an experimental output may warrant human review before there is a complete product. Products without a new human UI can omit the visual/mock branch and use an appropriate artifact or calling-agent scenario instead.

## Choose where to enter

| Situation | Read |
|---|---|
| Understand the product philosophy | [Applications for humans and agents](applications-for-humans-and-agents.md) |
| Explain a new idea or substantially change a product | [Design the project and write the handoff](design-project-and-write-handoff.md) |
| Prepare an existing product for a new design conversation | [Refresh a project for redesign](refresh-project-for-redesign.md) |
| Produce and select images, screens, or a rough design export | [Explore and select a UI reference](explore-and-select-ui-reference.md) |
| Turn the handoff into a usable coding environment | [Prepare the repository for agents](prepare-repository-for-agents.md) |
| Turn the selected design into real components and mock interactions | [Build the design system and interactive mock](build-design-system-and-interactive-mock.md) |
| Deliver, use, and improve real functionality | [Implement and review a working product](implement-and-review-working-product.md) |
| Put the product into its intended adoption channel | [Launch, integrate, and distribute](launch-integrate-and-distribute.md) |

The first design conversation covers task origin, outcomes, domain, artifacts, agents, human interaction, infrastructure, monetization, and distribution **together**. They are mutually informing topics, not a sequence of separate production stages. Distribution is designed here; the final step executes that design.

### Optional UI technique guides

These are local references used by repository preparation or UI implementation, not additional mandatory stages. Open only the guide needed for the current element or verification problem.

| Need | Read |
|---|---|
| Materials, illustrations, irregular shapes, layers, raster assets, or vectorization | [Create graphics and materials](ui-techniques/create-graphics-and-materials.md) |
| State-driven animation, characters, or spatial elements | [Implement motion and spatial elements](ui-techniques/implement-motion-and-spatial-elements.md) |
| Reference comparison, visual regression, or targeted UI enforcement | [Verify UI behavior and visuals](ui-techniques/verify-ui-behavior-and-visuals.md) |

## Continue without restarting

For an ordinary implementation task, start with the repository's `AGENTS.md`, current project decisions, and active work plan. Locate the next useful result and any dependent human decision. A missing document heading is not a reason to restart discovery.

For a substantial change of audience, purpose, interaction, or distribution, refresh the current implementation first, then return to the full design conversation. Reconsider the product without automatically discarding its technical foundation.

The human primarily evaluates a usable scenario or meaningful artifact, rather than reviewing every line of code and every document. Agents own engineering verification and current project documentation. Between agreed review points, continue autonomously within the assignment.

All repository-facing documents and commit messages are in English. Conversation can use the human's preferred language. Use paragraphs where they suffice; add structure only when it helps a reader decide, execute, verify, or resume.
