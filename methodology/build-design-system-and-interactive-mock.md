# Build the Design System and Interactive Mock

**Where this happens:** a coding agent in the repository, using a browser to inspect the application and showing the result to the human.

**Inputs:** the project handoff, accepted visual materials, and a repository whose applicable quality checks already run. Existing UI and components are additional material, not unquestionable authority for a changed product.

**What it produces:** real, reusable UI code and a working mock with representative data and interactions. The human can experience the proposed product before real model calls, persistence, and integrations are connected. The UI code is intended to continue into the product; the fixtures and scripted effects are explicitly mock behavior.

## Understand the target before changing code

Read the accepted interaction and visual decisions. Establish what each reference governs: appearance, behavior, content, or implementation constraints. When they conflict, resolve the important discrepancy rather than silently choosing whichever source is easiest to implement.

For an existing UI or generator export, run available versions, inspect representative states, and identify the accepted visual reference. Locate actual themes, components, installed libraries, and their uses in code. Similar screenshots do not prove component reuse.

Reuse suitable components and behavior. Test a proposed component library on a representative element before spreading it through the app. Do not replace it without a reason, but do not let its default appearance overrule the accepted design either.

A design-tool export may be rebuilt where its structure is unsuitable. Preserve accepted appearance and behavior while extracting a coherent implementation. Do not merge several exports into parallel themes. If the product itself is being redesigned, name the intended behavioral changes; do not disguise them as styling refactors.

## Build the smallest real system that supports the scenario

The interaction model defines attention and actions. The visual language defines composition, typography, colors, surfaces, and state expression. The design system makes recurring decisions reusable in documentation and code. A collection of buttons alone cannot choose or guarantee the interaction model.

### Keep `DESIGN.md` practical

Explain how the user works, what relationships must hold, where the theme and components live, and how new UI should be added. Include important source priorities and agreed exceptions. The reader is the next implementation agent, not someone evaluating an essay about aesthetics.

Prefer relationships over copied screenshot coordinates: “the notebook is primary; the compact chat remains available below it; opening history does not destroy the current song context.” Numerical limits are valid when they express a real decision, such as a reading width or minimum control area.

Store exact values in the theme code and their purpose in the document. Do not maintain another handwritten copy of the same color table. For a small system, a few paragraphs and paths may be enough.

### Centralize recurring design decisions as tokens

Define the needed color and type roles, spacing, radii, borders, and shadows; add layout, layer, or motion values when they are genuinely shared decisions. A token is a named design decision, not every CSS declaration.

Separate a reference palette from semantic roles. The same color can serve roles that later diverge, and one role can have different values across themes. For example, the numbers below are illustrative, not a prescribed theme:

```css
:root {
  --ref-brass: #c69a67;
  --color-action-primary: var(--ref-brass);
  --color-on-action-primary: #241a11;
  --radius-control: 0.75rem;
  --space-control-block: 0.625rem;
  --space-control-inline: 1rem;
}

.button[data-intent="primary"] {
  background: var(--color-action-primary);
  color: var(--color-on-action-primary);
  border-radius: var(--radius-control);
  padding: var(--space-control-block) var(--space-control-inline);
}
```

Add the component's required focus, hover, disabled, and other states. A small project may need only CSS variables or its existing theme. Use JSON, TypeScript, or cross-platform generation only when real consumers justify the extra representation. With Tailwind, connect values through the installed version's theme mechanism instead of maintaining a separate palette in classes.

Calculated geometry, `0`, `100%`, a unique contour, and local construction values need not all become global tokens. Do not merge independent decisions simply because their current numbers happen to match.

### Create the necessary primitives and domain components

Build only the shared controls required by the scenario: for example, Button, Field, Surface, Tabs, or an icon button. Their APIs should express useful choices such as intent, size, selection, or state instead of forcing every screen to reconstruct their styling.

Preserve semantic HTML, labels, focus, and keyboard operation. Suitable unstyled behavioral primitives can provide complex control behavior while the project owns appearance. Avoid a wrapper for every text node or `div` when it adds no useful responsibility.

Domain components own product-specific composition and states. A book can own its cover, paper layers, tabs, and rule that tabs are hidden when closed. A form can preserve input while submission is pending. A generic button should not know about songs, and a generic surface should not know how to load routes.

Do not build a universal component with dozens of unrelated flags merely to remove a few similar lines. Common visual rules belong in shared primitives; meaningful product behavior belongs at the appropriate domain or composition boundary.

## Make the mock behave like the proposed experience

Use realistic or plausible content, not only short placeholder labels. Support the representative user path, transitions, and essential empty, populated, working, error, and success states. Include important revisions, navigation, context preservation, long text, languages, and target viewport sizes.

Scripted agent replies and simulated processing are valid here, but identify them as such. Do not imply that a model generated the content or an external service persisted it. Keep the mock boundary simple enough to replace without inventing a large speculative backend.

Respect actual human permissions. A read-only workspace should not gain direct editing just because it is convenient to implement. Conversely, do not replace intended direct manipulation with a chat command. Demonstrate what the user sees after an operation, including failure or incomplete information where consequential.

Build one representative scenario first and open it in the browser immediately. Check actions and state transitions, not just a static screen. Refine the shared system on that scenario, then use it for the remaining agreed states and screens. A component example page or Storybook can help when there are enough variants; neither is mandatory.

## Match the accepted direction and inspect real behavior

Compare reference and implementation at comparable viewport dimensions, content, zoom, and font readiness. Browser chrome or a different aspect ratio can make a layout comparison misleading. Start with composition, attention hierarchy, proportions, readability, and typography before small decorative details.

Do not make the screen one background image with invisible controls. Text, input, navigation, and primary actions remain a real interface. A reference never authorizes unreadable content or inaccessible controls; propose a minimal, justified adjustment rather than copying a defect.

Support intermediate sizes and meaningful overflow. “No scrolling” requires a usable way to reach the content, not clipping it. Two static references do not fully specify responsive behavior.

Special visual work is selective:

- For materials, irregular shapes, or illustrations, use [Create graphics and materials](ui-techniques/create-graphics-and-materials.md) only for the affected elements.
- For meaningful animation, characters, or spatial behavior, use [Implement motion and spatial elements](ui-techniques/implement-motion-and-spatial-elements.md).
- For reference comparison, regression, or targeted enforcement, use [Verify UI behavior and visuals](ui-techniques/verify-ui-behavior-and-visuals.md).

Choose a technique for an element, not automatically for the whole application. One three-dimensional object does not require a WebGL interface. Basic browser review and the repository's selected checks apply regardless of optional techniques.

## Refine at the responsible level

Express feedback as an observation and intended effect: “the secondary panel competes with the document,” not only “make it nicer.” Preserve the parts already accepted.

Fix the shared rule where appropriate: a repeated color in its token, every field's appearance in the primitive, an object's internal relationships in its domain component, and one screen's layout in its composition. Check several consumers after changing a common rule. Do not patch each screen with a new exception.

If the application is tidy but the user must hunt through panels, reconsider the interaction model. If it no longer resembles the chosen direction, return to the visual reference rather than treating the problem as many unrelated details. A material problem may need a better asset, not a new palette.

During migration, remove replaced styles and duplicate components after their consumers move. Do not keep competing themes indefinitely. When several agents contribute, share the interaction model, theme ownership, component contracts, and naming. Divide work by scenarios or coherent features, not by asking each agent to invent an independent design system.

## Show the result and carry decisions forward

The human should be able to open the mock and perform the intended path. Provide the entry point, representative data or scenario, and important known limitations. Internal documentation and code remain available without being the default object of human review.

The mock is ready for that review when the intended interaction works, important states match the chosen visual direction, content remains accessible, shared components are genuinely used, and applicable checks pass. `DESIGN.md` should match the implementation. Name remaining deviations instead of hiding them.

The review may change product assumptions, including agent capabilities or artifact behavior. Update the project handoff and work plan before dependent implementation. Do not treat mock acceptance as evidence that real models, persistence, authorization, or payments work.

After the agreed review, continue with [Implement and review a working product](implement-and-review-working-product.md), preserving the UI system and replacing only the mock behavior that the next slice actually makes real.

## Implementation references

Consult the installed versions when applying these techniques. These references support the techniques, not a requirement to read external documentation for every UI task.

- [Design Tokens Format Module](https://www.designtokens.org/tr/2025.10/format/)
- [Tailwind theme documentation](https://tailwindcss.com/docs/theme)
- [WAI-ARIA Authoring Practices: patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
