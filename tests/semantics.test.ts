import {expect,test} from 'bun:test';
import jsonld from 'jsonld';
import {Parser,Store as RdfStore} from 'n3';
import SHACLValidator from 'rdf-validate-shacl';
import {database} from './db';
import {Store} from '../src/server/store';
import {exportGraph,turtle,namespaces} from '../src/domain/export';
import {shacl} from '../src/domain/shacl';
test('JSON-LD and Turtle parse to the same lexical graph and satisfy generated SHACL',async()=>{
 const snapshot=await new Store(database()).snapshot();const doc=snapshot.records['brain-computer-interface']!.published!;const base='https://neurolex-preview.sanocks.workers.dev';
 const ttl=await turtle(doc,snapshot.schema,base);const parsed=new Parser().parse(ttl);const graph=new RdfStore(parsed);
 const nquads=await jsonld.toRDF(exportGraph(doc,snapshot.schema,base) as jsonld.JsonLdDocument,{format:'application/n-quads'}) as string;
 const fromJson=new Parser({format:'N-Quads'}).parse(nquads);expect(new RdfStore(fromJson).equals(graph)).toBe(true);
 expect(graph.getQuads(null,namespaces.ontolex+'reference',base+'/id/concept/brain-computer-interface',null)).toHaveLength(2);
 const validator=new SHACLValidator(new RdfStore(new Parser().parse(shacl(snapshot.schema))));const report=await validator.validate(graph);expect(report.conforms).toBe(true);
 expect(graph.getQuads(null,namespaces.rdf+'type',namespaces.lexicog+'UsageExample',null).length).toBeGreaterThan(0);
 const noExampleText=new RdfStore(parsed.filter(q=>q.predicate.value!==namespaces.rdf+'value'));expect((await validator.validate(noExampleText)).conforms).toBe(false);
 const malformed=new RdfStore(parsed.filter((q)=>q.predicate.value!==namespaces.ontolex+'canonicalForm'));expect((await validator.validate(malformed)).conforms).toBe(false);
});
test('typed dates and explicit rich-text language agree across JSON-LD, Turtle and SHACL; senses have unique owners',async()=>{
 const snapshot=await new Store(database()).snapshot();const schema=structuredClone(snapshot.schema);schema.fields.push({id:'date',label:'Date',description:'Date',section:'Metadata',type:'date',predicate:namespaces.dct+'created',target:'article'});
 const doc=structuredClone(snapshot.records['brain-computer-interface']!.published!);doc.values.date='2026-10-09';doc.values.definition={type:'doc',attrs:{language:'en'},content:[{type:'paragraph',content:[{type:'text',text:'English definition'}]}]};
 const base='https://example.test';const graph=new RdfStore(new Parser().parse(await turtle(doc,schema,base)));
 const fromJson=new RdfStore(new Parser({format:'N-Quads'}).parse(await jsonld.toRDF(exportGraph(doc,schema,base) as jsonld.JsonLdDocument,{format:'application/n-quads'}) as string));expect(graph.equals(fromJson)).toBe(true);
 expect(graph.getQuads(null,namespaces.dct+'created',null,null)[0]?.object).toHaveProperty('datatype.value',namespaces.xsd+'date');expect(graph.getQuads(null,namespaces.skos+'definition',null,null)[0]?.object).toHaveProperty('language','en');
 const validator=new SHACLValidator(new RdfStore(new Parser().parse(shacl(schema))));expect((await validator.validate(graph)).conforms).toBe(true);
 const missingOwner=new RdfStore(graph.getQuads(null,null,null,null).filter(q=>q.predicate.value!==namespaces.ontolex+'isSenseOf'));expect((await validator.validate(missingOwner)).conforms).toBe(false);
});
