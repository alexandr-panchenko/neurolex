# Implement and Review a Working Product

**Where this happens:** an agent working in the repository and authorized deployment environment, followed by the human using the result or inspecting a meaningful output.

**Inputs:** current product decisions and plan, the prepared repository, the accepted mock/design where applicable, and relevant experiments. Unverified dependencies must be visible and assigned work; they need not all prevent independent progress.

**What it produces:** a useful vertical slice or a complete small application, evidence about its behavior, and decisions for the next iteration. A slice is a real path to a user's outcome, not an isolated page, endpoint, or infrastructure milestone.

## Choose the next useful result

Follow the work plan, updating it when a mock review or experiment changes the basis. Keep the whole product's intended scope distinct from the next implementation increment. For a small application, implementing the whole thing can be the simplest useful unit.

Trace the real task from its actual entry point through context access, domain operations, persistence, model or service work, and output retrieval or review. Include the intended external-agent path when that is part of the product; a browser demo alone does not prove it.

A concise behavior example can make an important boundary executable. For instance:

```gherkin
Scenario: A recorded lyrics revision produces a playable song
  Given an authorized user has a song workspace
  When the agent commits a new lyrics revision
  Then that revision remains available in the workspace
  And audio rendering is started for that revision
  And the user can inspect its status and play the completed result
```

Add consequential failure or permission examples where needed. Do not convert every planning paragraph into a test scenario, or force every small task into a lengthy template.

## Resolve practical uncertainties where the work needs them

A research-backed choice of a model or hosting service is not the same as a successful deployment. Test significant assumptions before building large dependent regions. Preserve representative inputs, versions/configuration, outputs, and conclusions at the level needed to reproduce or understand the result.

For example, a chosen music model may expose insufficient parameters in an existing hosted version. Deploying another version, selecting suitable hardware, and inspecting generated audio can be one bounded implementation investigation. Keep the failed configurations as relevant evidence; do not claim universal feasibility from one successful case.

Novel semantic capabilities may require a more substantial loop: test an artifact, inspect how it serves the intended outcome, change prompts or decomposition, and repeat. A human may need to read the generated document or listen to the result before the dependent product is implemented. For a writer/reader experiment, evaluate the resulting text and intended progression of understanding, not only whether both agents exchanged messages.

Research can happen in a chat or a repository. What matters is whether the evidence answers the question, and which work depends on it. Accepted choices, implementation status, and demonstrated behavior remain distinct in the project documents.

## Implement under the existing quality contract

Use accepted semantic operations and artifacts. Do not silently redefine the interaction model, domain invariants, agent responsibilities, or business model because a different implementation is easier. Raise material changes explicitly; resolve ordinary local engineering choices autonomously within the assignment.

Connect the real behavior to the existing UI system rather than rebuilding it independently. Maintain clear boundaries around remaining fixtures. Do not describe a fallback or simulated route as proof that a real integration works.

Authentication, authorization, billing, and deployment prerequisites are ordinary dependencies of the scenario. Implement them early enough to exercise the intended flow; do not reserve them for a universal final phase. When credentials are unavailable, keep a controlled mock where useful and state exactly what remains unverified. Never equate an API that can be called with permission to spend or alter external state.

Extend the harness as real behavior appears:

- Code checks cover the affected types, modules, integration boundaries, builds, and user path.
- Artifact checks cover relevant schemas, references, invariants, transitions, and deterministic renderability.
- Agent evaluations cover representative task completion, tool selection, source fidelity, uncertainty, user preferences, state integrity, and appropriate initiative.

Treat consequential false claims or state violations as failures: claiming an update without an operation, inventing source data, asking for context already available, erasing protected history, bypassing validation, or fabricating evidence. Do not weaken tests or update baselines simply to obtain green results.

Run expensive or externally effectful evaluations within the agreed policy. Retain a clear distinction between deterministic fixture tests and live-provider checks. A human's successful demo does not replace engineering checks, and passing checks do not establish that the product fits the user.

## Keep work integrated and resumable

Make coherent, frequent commits when applicable checks pass. Use a short English subject and a short informative body. Do not wait for the entire application to be finished, and do not introduce a mandatory PR ceremony where trunk-based work is permitted.

For example:

```text
Preserve source context across song revisions

Keep story references when the agent appends a verse.
Cover revision selection and returning to the original context.
```

Respect other agents' unfinished work and shared contracts. Follow the repository's actual push and deployment permissions. Fix an integration or CI failure instead of continuing to build on an unacknowledged broken foundation.

Update relevant decisions, evidence, limitations, and next work as part of the change. The repository should explain what is intended, what exists, what was checked, and what to do next. These can be sections of existing documents; they are not compulsory separate ledgers.

## Review the real user path

Provide an accessible result and a concrete way to try it: a URL or command, suitable inputs, and the meaningful outcome to inspect. State remaining mocks, untested integrations, and relevant deployment limitations. Distinguish local success, successful CI, and the version actually deployed.

The human primarily evaluates the experience: whether the task completes, the artifact is useful, context is preserved, the agent asks or acts appropriately, and review or intervention feels natural. Relevant outputs include a song, processed template, generated script, playable video, calendar result, or another artifact—not only screens.

The human does not have to read every diff, test, or design document. The agent owns those engineering responsibilities and supplies targeted explanations where a consequential decision needs attention. Stop dependent work at an agreed participation point, not after every successful commit. Independent, already-delegated work may continue.

## Turn observations into the next iteration

Record concrete friction, failures, missing context, wrong initiative, confusing state, quality problems, and changed product understanding. A short note plus a result reference often suffices.

Find the responsible level rather than assuming every issue is UI polish. The change may belong to the desired outcome, domain operation, artifact, agent behavior, trigger, human projection, visual rule, or physical architecture. Update the appropriate decision and the next work plan.

A local correction stays in this implementation/review loop. A substantial change of purpose, audience, interaction, or distribution calls for [refreshing the existing project](refresh-project-for-redesign.md) and returning to the full design conversation while retaining useful technical foundations.

A usable release can proceed to [Launch, integrate, and distribute](launch-integrate-and-distribute.md). Real adoption produces more observations and can re-enter this loop; it is not a declaration that product development is finished.
