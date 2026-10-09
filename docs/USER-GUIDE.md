# User guide

[Read the Russian guide on the website](https://neurolex-preview.sanocks.workers.dev/help). UI labels below match the Russian application.

## Contents

- [Getting started](#start)
- [Search and topics](#search)
- [Signing in and permissions](#access)
- [Creating a card](#create)
- [What belongs in each article section](#sections)
- [Inline editing and autosave](#edit)
- [Topics, related concepts and inline links](#links)
- [Drafts, publication and history](#publish)
- [Importing CSV, TSV and JSON cards](#files)
- [Importing NeuroLex / InterLex and MeSH](#external)
- [The global dictionary schema](#schema)
- [Assistant and source research](#assistant)
- [Exports and format compatibility](#export)
- [Connecting an external agent](#agents)
- [Feedback and common problems](#feedback)

<a id="start"></a>

## Getting started

The dictionary combines English terms, Russian equivalents, definitions, discourse examples and linguistic analysis. Published articles are readable without signing in. Author access is required to enter cards, read drafts and submit feedback.

1. Search for a term, Russian equivalent or abbreviation.
2. Open an article and follow related concepts and sources.
3. To enter a card, sign in and select “Создать статью” (Create article). Fill the English term, Russian equivalent and definition.
4. Wait for “Черновик сохранён” (Draft saved). Review the text and sources, then publish when ready.

<a id="search"></a>

## Search and topics

Search does not require an assistant: use an English or Russian term, abbreviation or phrase from the article. For example, EEG or электроэнцефалография. Exact title matches rank before matches inside article content.

Topics provide a way to explore the dictionary. Select a topic to filter the list, or “Все темы” (All topics) to return to the full dictionary. Results are paginated with “Показать ещё 50” (Show 50 more).

Signed-in authors also see drafts. Visitors see published articles and their published versions only. If there are no results, shorten the query, try the other language or clear the topic filter.

<a id="access"></a>

## Signing in and permissions

Select “Вход автора” (Author sign-in). Enter a personal key if one has been issued to you. Email sign-in is used when configured by the site owner. Signing in with an arbitrary email does not grant editing rights.

Actions depend on assigned permissions: reading drafts, changing articles, publishing and changing the global schema are separate permissions. If an action is missing, ask the owner for the appropriate access. Never include your personal key in feedback.

<a id="create"></a>

## Creating a card

A dictionary article and its structured card are one document. Sections are edited directly on the page. The English term, Russian equivalent and definition are required; other information can be added later.

The identifier determines the article URL. Use a short Latin identifier with digits and hyphens, such as tract-tracing-assay. It differs from the displayed title: the title can change while the URL stays stable.

1. Select “Создать статью” (Create article) and enter an identifier.
2. Fill the required content. Do not invent a definition merely to make the card save.
3. Add an abbreviation, dictionary topic and other information where relevant.
4. Wait for save confirmation. A new card stays a draft until explicitly published.

<a id="sections"></a>

## What belongs in each article section

Definition states the meaning of the term. Cite its source and distinguish a verbatim external definition from your own paraphrase. Its language can differ from the Russian equivalent.

Linguistic commentary contains your analysis of form, meaning, translation and usage. It is an author contribution, separate from external definitions.

Term in discourse contains concrete speech or text excerpts. An example can include language, episode, speaker, URL, timestamps and transcript provenance. An attested excerpt requires a URL and transcript provenance. A synthetic example is not a quotation.

Example commentary records your interpretation. An unusual paraphrase or metaphor does not automatically create a new lexical sense. Discourse functions can be filled where useful.

Sources contain titles, URLs, attribution and known licenses. External mappings relate a concept to another database: exactMatch means exact correspondence, closeMatch a close correspondence, and relatedMatch a related concept. Matching labels alone are insufficient for exactMatch.

<a id="edit"></a>

## Inline editing and autosave

Select “Редактировать статью” (Edit article). Titles, sections and prose stay in place. Focus text to reveal its toolbar: emphasis, quotation, list, heading, links and text language. Choose “Английский” (English) for an English imported definition.

Changes automatically save to a draft after a short pause. “Завершить редактирование” (Finish editing) returns to reading. Publication is separate and does not happen during ordinary editing.

Watch the save status. Missing required content prevents server persistence; complete it. A local browser copy helps recover from connection failures in the same browser. Moving between devices or browsers requires confirmed server persistence.

If another author or agent has changed the article, a newer version is not automatically overwritten. Read the message, open the current revision and reconcile your changes. Replacing current content with a recovered local copy is a separate explicit action.

<a id="links"></a>

## Topics, related concepts and inline links

Assign a dictionary topic inside the article. Type a name and select an existing topic or create a new one from the entered name. Topics group articles; they do not change the global card schema. A topic used only by a private draft does not expose that draft to visitors.

To add related concepts, select “Добавить: связанные понятия” and type an English title, Russian equivalent or abbreviation. Select a found article: the relationship stores its identifier, not a free-text label.

Related concepts below an article and links inside a definition provide different navigation paths. Select words and use “Ссылка на термин…” in the text toolbar for an inline term link. You can also reference an existing source or an external page.

First add the source to the Sources section, then insert its text reference. To publish, links to other articles must point to published content.

<a id="publish"></a>

## Drafts, publication and history

Drafts are accessible to authors and agents with read permission. Visitors see the last published revision. Editing a published article updates its draft; public content stays unchanged until the next publication.

Review the definition, sources, relationships and language. Select “Опубликовать черновик” (Publish draft) when reading or “Сохранить и опубликовать” (Save and publish) while editing. Publication permission is required.

In History, choose a revision to compare with its predecessor. The whole document remains visible: removed lines are red, added lines green, and changed words receive stronger highlighting. The first revision appears as the original document.

“Восстановить эту редакцию в статье” restores earlier content into the editor and saves it as a new revision. History is retained; publishing restored content remains separate.

<a id="files"></a>

## Importing CSV, TSV and JSON cards

Open Import, download a current-schema CSV or JSON template, fill it, then select the file. Map CSV/TSV columns to current schema fields. Unmapped columns are skipped. English term, Russian equivalent and definition must map to required fields. If no identifier is supplied, one is derived from the English title.

Each row is a card. In CSV, enclose text containing commas or line breaks in double quotes and double any embedded quotation marks. Use semicolons for repeated simple values. Nested groups such as sources and examples use JSON arrays.

Use the JSON dictionary export to transfer all supported fields and formatting. Upload that bundle or an array of documents. A bundle with a different schema version requires explicit schema reconciliation before import.

Select “Проверить импорт” (Check import). Preview shows new/existing articles, errors and changes. Existing populated author fields are retained; select “Заменить это поле” only for deliberate replacements. A revision changed after preview can require a fresh preview.

Select “Импортировать черновики” (Import drafts). Imports do not publish. A batch supports up to 100 cards; divide larger collections into files.

Example CSV (replace the definition and add a source after import):

```csv
term,equivalent,definition
tract tracing assay,исследование трассировки нервных путей,"Your sourced definition"
```

<a id="external"></a>

## Importing NeuroLex / InterLex and MeSH

In Import, use the visible external dictionary section, choose a source, and enter its identifier and a Russian equivalent. Select “Получить и проверить”, then “Проверить импорт” and review the proposal before saving.

NeuroLex / InterLex supports the public NeuroLex/NIFSTD investigation module with explicit InterLex mappings. For example, nlx_inv_090919 and ilx_0107518 identify Tract tracing assay. This is a historic module; not every current InterLex ID is present. Records lacking explicit definitions are not automatically imported.

Import retains the unchanged English definition, NeuroLex ID, explicit InterLex ID, provenance and license. Supply the Russian equivalent separately; it is not attributed to the external dictionary. Add your own linguistic analysis and podcast evidence.

For NLM MeSH, use a descriptor ID such as D015225 for Magnetoencephalography. MeSH is a separate source with its own definitions and reuse terms; it does not replace NeuroLex.

Similar names do not automatically establish equivalence to an existing local article. Review meaning, provenance and reuse conditions before publication.

<a id="schema"></a>

## The global dictionary schema

“Раздел словаря” inside an article is the topic of one card. “Структура словаря” in author actions is the global field schema for all cards. Changing it affects the dictionary, so it is a separate action.

Add an optional field with an identifier, label, type and display section. It becomes available in every article editor and appears when populated. Required bilingual titles and definition remain the card foundation.

Use ↑ and ↓ in the schema table to reorder content fields; core title elements retain a fixed layout. Sections follow their first field. Semantics settings edit description, property URI and article/concept target. Select “Проверить влияние” (Check impact) and review affected articles and errors. Apply after successful validation. Renames, removals and type changes need explicit transformations. If the dictionary changes after preview, preview again.

Previous revisions remain in history. Coordinate complex transformations with the owner or an external agent with schema permission.

<a id="assistant"></a>

## Assistant and source research

Open Assistant after signing in. It works when the owner has connected a model. If sending is unavailable, ordinary search, card entry and imports remain usable. External source search is separately available when its service is connected.

By default, the assistant reads but does not modify the dictionary. Enable “Разрешить изменение черновиков” for editing tasks. Schema changes and publication are separately enabled and cannot exceed your existing permissions.

Give a concrete task: “Compare EEG and BCI definitions and cite the source articles” or “Propose commentary on this excerpt, separating quotation from interpretation”. To persist a result, explicitly request the change and enable draft editing.

Inspect the answer, citations and performed actions. A proposal in a reply does not itself mean a card was saved. Check new claims, definitions and quotations against their sources; do not fill missing evidence with guesses.

<a id="export"></a>

## Exports and format compatibility

The JSON dictionary bundle transfers the current schema and documents with rich formatting. Public export includes published articles; the author export in Import includes drafts. It does not contain complete revision history or access credentials.

JSON-LD and Turtle below a published article express the same RDF graph: article, language-specific entries, forms, senses, concept, relationships and sources. RDF renders rich text as language-tagged plain text; use the JSON bundle to preserve formatting.

OntoLex-Lemon describes lexical entries, forms and senses; Lexicog describes article organization and usage examples. These specifications do not prescribe a mandatory list of dissertation card fields. Researcher annotations and discourse metadata extend them through separate properties.

The supported profile has one English/Russian entry pair and one concept per article. Polysemy, independently shared concepts and arbitrary external ontologies need model extensions. Export does not remove third-party licensing conditions.

<a id="agents"></a>

## Connecting an external agent

The owner opens Agent access and assigns a name and permissions. read allows drafts/history, write allows draft changes, publish allows publication, and schema allows global schema changes. Grant only necessary permissions.

A new key is displayed once, lasts 30 days and can be revoked. Store it in the client secret settings. Agents use HTTP or MCP and obtain the active schema and article revision before writing.

The client must support Bearer authentication. Never insert the key into a URL or article text. The integration guide documents endpoints, request examples and conflict handling.

<a id="feedback"></a>

## Feedback and common problems

After signing in, use Feedback below an article. Describe the action, expected result and actual result. The current page path is attached automatically. For example: “In article X, I typed EEG into related concepts but no suggestions appeared”. Do not include access keys. Feedback is private to the owner.

A card does not save: check required fields, marked errors and connection status. An article is invisible to visitors: check publication. Public text lacks your changes: the saved draft still needs publication.

An external ID is missing: check source and identifier format. For NeuroLex, account for the supported module boundary. If a definition is absent, manually enter verified sourced content rather than inventing a value.

The owner reads submissions through Feedback in author actions. If you cannot sign in or access the form, send your description to the owner through your usual communication channel.

## Further documentation

[Integration: HTTP API and MCP](INTEGRATION.md) · [Semantic profile and audit](SEMANTIC-PROFILE.md) · [Operations and configuration](OPERATIONS.md)

This guide is generated from `src/content/help.ts`, the same bilingual content used by the website. Edit that source and run `bun scripts/build-guide.ts`; `--check` detects an outdated repository copy.
