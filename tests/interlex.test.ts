import {expect,test} from 'bun:test';
import {interlexRecord,interlexDocument} from '../src/server/interlex';
import {initialSchema,validateDocument} from '../src/domain/schema';
import {exportGraph,namespaces} from '../src/domain/export';
const nif='http://uri.neuinfo.org/nif/nifstd/nlx_inv_090919';
const ontology=`<${nif}> <http://www.w3.org/2000/01/rdf-schema#label> "Tract tracing assay"; <http://www.w3.org/2004/02/skos/core#definition> "An assay in which a tracer is injected."; <http://purl.org/dc/elements/1.1/contributor> "Original curator".`;
const mapping=`<${nif}> <http://uri.interlex.org/tgbugs/uris/readable/hasIlxId> <http://uri.interlex.org/base/ilx_0107518>.`;
const fetcher=(async(url:unknown)=>new Response(String(url).includes('mapping.ttl')?mapping:ontology)) as unknown as typeof fetch;
test('NeuroLex and explicit InterLex IDs resolve the same source, preserving English and attribution without inferred identity',async()=>{
 const source=await interlexRecord('nlx_inv_090919',fetcher);const byInterlex=await interlexRecord('ilx_0107518',fetcher);expect(byInterlex.source).toBe(source.source);
 const doc=validateDocument(initialSchema,interlexDocument(source,'исследование трассировки путей',initialSchema));
 expect(doc.id).toBe('neurolex-nlx-inv-090919');expect(JSON.stringify(doc.values.sources)).toContain('Original curator');expect(JSON.stringify(doc.values.externalRecord)).toContain('ilx_0107518');
 const graph=exportGraph(doc,initialSchema,'https://example.test')['@graph'];const concept=graph.find(n=>n['@type']===namespaces.skos+'Concept')!;
 expect(concept[namespaces.skos+'definition']).toEqual({'@value':source.definition,'@language':'en'});expect(concept[namespaces.skos+'exactMatch']).toBeUndefined();
 await expect(interlexRecord('https://evil.example',fetcher)).rejects.toHaveProperty('code','INVALID_INTERLEX_ID');await expect(interlexRecord('nlx_inv_090920',fetcher)).rejects.toHaveProperty('code','SOURCE_NOT_FOUND');
});
test('records missing an explicit definition or with invalid RDF cannot silently fabricate content',async()=>{
 await expect(interlexRecord('nlx_inv_090919',(async(url:unknown)=>new Response(String(url).includes('mapping.ttl')?mapping:`<${nif}> <http://www.w3.org/2000/01/rdf-schema#label> "Only label".`)) as unknown as typeof fetch)).rejects.toHaveProperty('code','SOURCE_INCOMPLETE');
 await expect(interlexRecord('nlx_inv_090919',(async()=>new Response('<html>')) as unknown as typeof fetch)).rejects.toHaveProperty('code','SOURCE_FORMAT');
});
test('rich-text language cannot bypass runtime language-tag validation',()=>{
 const doc=interlexDocument({id:'nlx_inv_090919',label:'Tract tracing assay',definition:'Definition',source:nif,interlex:[],statements:[],snapshotCommit:'fixture',moduleUrl:'https://example.test/source',mappingUrl:'https://example.test/mapping',retrievedAt:'2026-10-09',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',synonyms:[],citations:[],contributors:[]},'трассировка',initialSchema);
 const definition=doc.values.definition as {attrs:{language:string}};definition.attrs.language='not a language';expect(()=>validateDocument(initialSchema,doc)).toThrow();
});
