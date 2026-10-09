# Supported semantic profile

This project uses a small documented profile of [OntoLex-Lemon](https://www.w3.org/2016/04/ontolex/) and [Lexicog](https://www.w3.org/2019/09/lexicog/), both community specifications. It is not a reproduction of the original NeuroLex/InterLex field model. The verified targeted NeuroLex/NIFSTD import and its explicit InterLex identifiers are documented below; a complete live InterLex import is not claimed.

Each article has a stable slug-based `lexicog:Entry`, a `skos:Concept`, English and Russian `ontolex:LexicalEntry` resources, canonical `ontolex:Form` resources, and `ontolex:LexicalSense` resources referencing the concept. A `lexicog:LexicographicResource` groups entries. An English abbreviation is an additional form. This initial model has one concept per article; cross-article shared concepts and additional lexical senses are future extensions, not inferred from different podcast wording.

Definitions map to `skos:definition`, related concepts to `skos:related`, and source metadata to appropriate DCT properties. Researcher commentary, example evidence/status, timestamps and discourse classifications use explicitly published project properties. Exact, close and related external mappings remain distinct; labels alone do not imply identity. Source groups with explicit IDs retain their RDF identity across reordering. Other anonymous repeat groups currently have positional article-local identifiers; these should not be treated as reusable episode/entity identifiers.

Field configuration generates JSON Schema and SHACL within the supported set: text, rich text, number, boolean, date, enum, reference, repeated/nested objects. Runtime validation uses a Workers-compatible recursive validator, plus ProseMirror structural checks, safe links, citation-target checks and evidence constraints. JSON Schema is the portable shape contract; it does not express every editorial invariant. SHACL verifies graph structure and supported datatype/cardinality/enum constraints, not arbitrary JSON Schema features or all provenance rules. OWL reasoning is not used as validation.

ProseMirror JSON is the authoritative rich-text representation. Public HTML preserves supported paragraphs, headings, lists, quotations, emphasis, HTTP links, term references and source references. RDF exports carry plain textual values with language tags; formatting/citation marks remain lossless in the application's JSON bundle. Excerpts use their supplied language; researcher text defaults to Russian. Images are outside this profile and rejected.

Endpoints: `/context/1.jsonld`, `/vocabulary`, `/schema.json`, `/schema.shacl.ttl`, `/api/articles/:id/export`, and `?format=ttl`. Semantic article/concept/entry/form/sense IDs redirect to their article. Published exports exclude drafts. JSON-LD and Turtle were parsed and compared as RDF graphs, then validated using generated SHACL; removing a required lexical form fails validation.

The three illustrative definitions are sourced paraphrases. Synthetic usage examples are explicitly marked and must not be treated as podcast quotations. No corpus license is invented. Export of the application's state is not permission to republish third-party content.

## Specification audit — 9 October 2026

Reviewed against the primary [OntoLex core specification](https://www.w3.org/2016/04/ontolex/) (Lexical Entry, Form, Lexical Sense & Reference) and [Lexicog specification](https://www.w3.org/2019/09/lexicog/) (sections 2.1–2.5, 2.9–2.10). These are vocabulary specifications, not a mandatory list of article form fields or a certification scheme.

| Area | Implementation and verification | Boundary |
|---|---|---|
| Lexical identity | Separate EN/RU entries, canonical forms with language-tagged writtenRep, additional abbreviation form | One entry per language and one sense per entry |
| Sense/reference | Each sense explicitly has one reference and one isSenseOf owner; SHACL enforces cardinalities and owner class | Inverse sense ownership formerly implicit; now explicit. No inferred extra senses |
| Dictionary organization | LexicographicResource → entry → Entry → describes → LexicalEntry | Lexicog does not prescribe our editorial sections. LIME metadata, component hierarchies and form restrictions are outside this profile |
| Discourse examples | Existing project evidence groups also export as lexicog:UsageExample with rdf:value; usageExample links originate from the corresponding language's LexicalSense | No translation or attestation inferred. Other example languages retain content without falsely attaching to EN/RU senses |
| Definitions/language | skos:definition; optional ProseMirror doc.attrs.language overrides the section default; the editor retains and can change it | Imported English used to default incorrectly to Russian. New imports explicitly specify en; legacy author text retains its previous default |
| Datatypes | Date values export as xsd:date in both JSON-LD and Turtle, with matching SHACL | Previously dates exported as strings. Runtime additionally validates real calendar dates |
| Provenance/mappings | Sources, explicit external IDs, immutable source snapshot, rdfs:seeAlso and prov:wasDerivedFrom; exact/close/related mappings stay distinct | InterLex identifier correspondence is not automatically a local skos:exactMatch |
| Format checks | Parser comparison of JSON-LD and Turtle RDF graphs; SHACL positive and negative cases for missing forms, sense owners, usage text; typed date and English definition checks | Generated SHACL is a project profile check, not complete OWL reasoning or arbitrary external ontology validation |

The profile does not reproduce every NeuroLex field, support every OntoLex module, model polysemy/shared concepts independently, or import arbitrary RDF. Those are explicit extension boundaries, not evidence that the implemented core mapping is invalid. Rich formatting and source-reference marks remain preserved in the own-format JSON bundle; RDF textual exports do not encode those marks.

## Verified external source

The targeted adapter reads the official [SciCrunch NIF-Ontology repository](https://github.com/SciCrunch/NIF-Ontology), pinned to commit `e0b6941924a5dabcd62c5cab879e9b8c64571e4a`: `ttl/NIF-Investigation.ttl` plus `ttl/generated/NIFSTD-ILX-mapping.ttl`. The repository [license](https://github.com/SciCrunch/NIF-Ontology/blob/e0b6941924a5dabcd62c5cab879e9b8c64571e4a/LICENSE) is CC BY 4.0; original citations and source annotations are retained, and third-party definitions must retain their separate conditions. This is a pinned public NeuroLex/NIFSTD snapshot with explicit InterLex identifier mappings, not a complete or current live InterLex API export.

`nlx_inv_090919` and `ilx_0107518` both resolve to “Tract tracing assay”. The adapter preserves its unchanged English definition, original identifier, explicit InterLex correspondence, outgoing source statements, citation/contributor metadata, retrieval date, license and snapshot URLs. The Russian equivalent is supplied by the importer; it is not claimed to come from NeuroLex. Records missing an explicit definition, ambiguous mappings, noncanonical identifiers, failed responses, oversized files and invalid RDF fail explicitly. Ontology blank-node descriptions and imported parent classes are not reconstructed into local concepts. The standard preview/apply path creates a private draft and protects existing author fields and revision conflicts.
