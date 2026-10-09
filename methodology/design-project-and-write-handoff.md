# Design the Project and Write the Handoff

**Where this happens:** a conversation with the human, usually before handing work to a repository agent. The conversation can use research tools and run available experiments. A repository agent can also conduct this discussion directly.

**What it produces:** a project-specific handoff that explains the intended product, important decisions, remaining uncertainties, and the next work. Visual exploration and repository preparation can both begin from it. It is not the finished UI, nor proof that every integration works.

Read [Applications for humans and agents](applications-for-humans-and-agents.md) for the underlying product frame. For substantial changes to an existing product, first obtain the factual context described in [Refresh a project for redesign](refresh-project-for-redesign.md).

## Start with the human's account

Let the human explain the idea in their own terms before requesting a form. Read the relevant supplied materials. Distinguish existing implementation, constraints, preferences, proposed directions, and exploratory thoughts. Do not silently turn an interesting possibility into a requirement.

Build a coherent proposal, investigate missing facts, expose important assumptions, and use a project-specific questionnaire when it will improve agreement. The discussion can revisit any topic as understanding develops. Its purpose is to produce a usable handoff, not a separate document for every design concept.

Ordinary feedback is selective: the human often comments only on especially valuable points and things to change. Preserve the unchallenged working basis within the current assignment; do not demand approval of every sentence. Do not claim explicit approval that was never given, or treat silence as permission for new external actions or a reserved product decision.

## Discuss the whole product, not a sequence of isolated contracts

The following are connected lenses for one design conversation. Their order is a reading aid, not an execution dependency. A human interaction choice may clarify the agent's operations; a distribution constraint may change identity, deployment, or even the outcome.

### Why this project exists, and where its users' tasks originate

Distinguish the context of **building the product** from the context of **using the product** when they differ.

For a hackathon, the project may originate in competition requirements, with judges needing a repository and working demo during a review period. Inside that product, a user may bring a personal story and want a song. Both contexts matter; judges, intended users, callers, and payers need not be the same people.

Find the relevant brief, rules, existing materials, deadlines, and constraints. Then trace a real product task: who initiates it, where the context already exists, who may access it, how it enters the system, what is missing, and how the result returns. A task can originate in the application, another agent, a document, an external event, or a schedule. Avoid unnecessary manual re-entry of available context.

Define the desired result as a state of the world or useful artifact, rather than a recreation of manual steps. Identify what must be correct, what can remain uncertain, and who or what recognizes completion. Choose a representative scenario through which the human can later experience this result.

Discuss audience, positioning, adoption, and payment here—not after implementing the product. Determine whether the route is a demonstration, SaaS, agent integration, licensed utility, company pilot, service engagement, or another arrangement. Identify the payer, unit of value, permissions to incur cost, entitlements, and any human or agent access barriers. Deliberately choosing no payment for the current product or release is a valid decision.

### Domain, state, artifacts, and resources

Identify the entities, relationships, state ownership, meaningful operations, invariants, and effects required by the scenario. Prefer domain intent over raw persistence mechanics. Specify important differences between drafts, accepted revisions, generated outputs, and historical records.

Identify the artifacts people and agents create, inspect, download, modify, or hand off. Use existing formats when suitable. Define formats, ownership, lifecycle, validation, and consumers to the depth needed for actual boundaries. Do not invent an intermediate representation or separate catalog for every conceptual category.

Long-lived work should be understandable outside the conversation. Explain what persists, where authoritative state lives, and which history must not be overwritten.

Map outside resources separately from owned state: calendars, repositories, documents, storage, model providers, payment systems, and other services. Decide who obtains access, how references travel, which reads or writes are needed, and which operations produce external effects. “No user-owned external resources” does not imply “no infrastructure dependencies.”

### Human interaction and agent responsibilities, designed together

Describe the human's actual role. What do they see, read, hear, change, approve, or explore? Which actions are conversational, which are direct, and which belong only to an agent? What context and history must remain visible?

Choose the main workspace, object of attention, actions, navigation, feedback, and access to secondary tools. A chat, editor, notebook, canvas, world, search view, or monitoring dashboard is a starting idea, not a complete interaction model. Do not turn the feature list into equally weighted panels by default.

Separate levels: a document is a workspace; direct manipulation is a way to act; pagination is a way to view content. Hybrid products are valid when the primary and supporting roles are clear in each mode. Accessibility and discoverability still matter when controls are contextual.

Walk through “sees → acts → receives a change and feedback → continues.” Short prose or a rough sketch is sufficient at this point. State relevant devices, languages, realistic content, overflow behavior, and important empty, working, success, and error states. Visual styling comes later, but interaction choices are part of this discussion.

Use that scenario to refine the capabilities available to agents. For a read-only songbook, the agent might append a verse or select a revision while the person reads and listens. Committing a revision might deterministically start rendering. The human projection helped reveal those capabilities; it did not merely decorate a previously frozen catalog.

Distinguish a direct deterministic tool from a specialized agent performing interpretation. For significant boundaries, make inputs, outputs, permissions, preconditions, effects, errors, and completion/progress behavior clear. Select a transport for the actual caller; MCP is not mandatory for internal operations.

Prefer one agent for cohesive work. Split responsibilities when expertise, permissions, runtime, independently testable work, or stable artifact handoffs justify it. Specify why an agent wakes up and what it owns. Do not create several agents merely to exchange repeated conversational messages.

Capture a few product invariants where drift would matter: for example, preserve old revisions, keep the notebook read-only to the person, or never claim that state changed without executing its domain operation. These are project decisions, not a compulsory universal constitution.

### Concrete architecture, cost, and access

Choose enough physical architecture to prepare the repository and plan implementation. Explain where state, services, model calls, background work, and human/agent entry points live. Cover relevant authentication, permissions, failure/retry behavior, secrets, and deployment constraints.

Use the owner's working preferences as starting points, not compatibility guarantees:

| Workload or constraint | Preferred route to investigate |
|---|---|
| Web application, lightweight endpoints, routing, realtime or serialized room/user coordination | Cloudflare and the appropriate platform services. |
| GPU/model workloads | Replicate or fal, behind a suitable application boundary. |
| Reusable server/process, heavier runtime, native tools, or strong Google integration | Cloud Run Service. |
| Finite heavy work, media rendering, or batch processing without a persistent HTTP service | Cloud Run Job. |
| Isolated, bounded, stateless function without a useful reusable process lifecycle | Lambda, where it fits the project and verified service limits. |
| On-premise or a customer's mandated infrastructure | Select within that constraint; record the project-specific route. |

Check current official documentation for the selected service before relying on its limits, features, pricing, or deployment procedure. A strong Google dependency can justify starting with Cloud Run rather than trying Cloudflare first. Avoid directly coupling domain semantics to an inference vendor when a small provider boundary is useful; do not build a large abstraction framework preemptively.

The usual application stack is TypeScript, React, and Vite. Bun is preferred for package management, tests, and suitable build tasks, not as a required production runtime. The deployed runtime follows the platform and workload.

Identify account, secret, authorization, billing, and model-hosting prerequisites now. Their absence is a concrete dependency, not a reason to design payment or authentication only at the end. Plan the implementation at the earliest point where the real scenario needs it. Access to paid experiments or production changes must stay within delegated authority.

## Resolve uncertainty using the appropriate method

| What is missing | How to resolve it |
|---|---|
| A fact available in project materials or external documentation | Retrieve it and retain the relevant source. |
| An unspoken human intention, preference, or constraint | State the current interpretation and ask a focused question. |
| A decision neither participant has made | Compare options, explain tradeoffs, recommend a choice, and decide within the agreed authority. |
| A practical capability that available evidence cannot establish | Run a bounded experiment and inspect its result. |
| A decision that a prototype, usage, or later condition will clarify materially | Record the reason to defer and a concrete return point. |

These are routes, not exclusive boxes. Finding a model, choosing a hosting route, testing exposed parameters, changing hardware, and inspecting output can be successive parts of one investigation.

Do not defer a useful decision merely because it is not needed by the next coding task. Broad early design and a narrow first vertical slice are compatible. Conversely, do not exhaustively specify hypothetical scale or interaction details that are much easier to judge after a prototype.

An experiment should answer a consequential question using representative inputs and a clear criterion. Preserve what was actually run, the configuration, outputs, limitations, and implications. The human may need to read, listen to, or otherwise experience the output. Merely finding deployment instructions is not a successful deployment experiment.

A selected approach can enter the handoff before runtime validation, provided its condition is visible and dependent work is planned accordingly. Run a critical experiment before committing substantial dependent implementation; independent work may continue. Experiments can happen in the conversation, a sandbox, or the repository. They are not one mandatory phase between topology and UI.

## Review a project-specific questionnaire

The questionnaire is a review interface for this particular proposal, not a fixed list embedded in the methodology. Group it by topic, give questions stable identifiers, and include only substantive decisions or assumptions. A complex project may warrant 100–200 questions; quantity is not a target.

For each useful question, state the decision, the recommended answer and its main reason or assumption, and meaningful alternatives. The purpose is to make agreement and correction easier—not to transfer all design work to the human.

For example:

> **Q12 — Who supplies source materials for the first release?**  
> **Recommended:** the calling agent passes references and context, because it already has those materials.  
> **Alternative:** this application discovers them itself, expanding access and retrieval work.  
> **Check:** does the caller actually have the required context?

The human can accept recommendations by identifier or range, change scope, ask for research or reasoning, assign an experiment, or defer until a specified result exists. “I do not know” invites help choosing; it is not a dead end.

For explicit questionnaire review, use explicit answers or accepted ranges by default. If sequential review with implicit acceptance is agreed, apply it only within a clearly reviewed range. Answering a late question alone does not establish that all earlier questions were read. Partial responses do not approve the unread remainder.

Absorb the resulting decisions into the project documents. Preserve outstanding questions where they affect work. The implementer should not have to reconstruct requirements from the original questionnaire and a conversation transcript.

## Produce the handoff and define the next work

Write concise English project documents, updating existing ones where possible. Explain the intended experience and outcome, domain and agent behavior, important constraints, architecture choices, adoption/payment route, evidence, and unresolved dependencies. Separate what is accepted, what is implemented, and what is verified.

The visual-design reader needs the scenario, interaction model, representative content, target states, and constraints. The repository agent needs the selected stack, technical boundaries, prerequisites, initial checks, and the next executable work. Share stable project facts rather than copying a complete specification into both assignments.

A work plan should identify the next usable result, the work needed to get there, relevant dependencies, verification, and the next human participation point. Its purpose is for an agent to resume without reconstructing the discussion. A few paragraphs or task lines can do this; do not create a large structure for every small task. Detailed later implementation tasks can be refined after the mock reveals more.

When a behavioral boundary benefits from precise examples, a short Given/When/Then scenario is appropriate. Use it to clarify behavior, not to force research notes, preferences, and every design decision into one notation.

The handoff is ready when a designer can explore the intended experience and a repository agent can prepare the work without inventing the product's essential meaning. It may still contain bounded research tasks and explicit unknowns. It does not authorize an uninterrupted implementation of the whole imagined product.

Continue with [visual exploration](explore-and-select-ui-reference.md) and [repository preparation](prepare-repository-for-agents.md). When later visual or usage evidence changes the product, update these decisions rather than treating the original handoff as immutable.
