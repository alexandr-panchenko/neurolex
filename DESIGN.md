# Wiki experience baseline

The dictionary article is the primary workspace. A compact left rail holds bilingual search results and topic navigation; the centre is a readable document with definitions, linguistic commentary, discourse examples, related terms, and sources. A lightweight contents rail appears when space permits. The mobile layout moves article navigation above the document.

The baseline uses white paper, quiet grey boundaries, blue links, serif article headings, and sans-serif controls. Shared roles and responsive rules live in `src/ui/theme.css`. `App.tsx` owns reading and authoring, `RichEditor.tsx` provides inline ProseMirror editing, and `RichText.tsx` renders article content. Editing stays in the article layout. History renders document changes with line and word highlights. Discourse examples use ordinary subheadings and readable body text.

Author changes save automatically. Related concepts have searchable suggestions. Topics are selected or created within the article and feed dictionary navigation. Persistence, authentication, publication, history, schema operations, imports and semantic exports use the Worker and shared domain layer.

Do not put development status, demonstration notices, working-name disclaimers, infrastructure details or editorial reminders in the interface. Communicate implementation status and limitations in chat and repository documentation. Keep genuine evidence provenance in article content and useful save/error feedback in the author workflow.
