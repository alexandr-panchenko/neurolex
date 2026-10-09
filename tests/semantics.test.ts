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
 const malformed=new RdfStore(parsed.filter((q)=>q.predicate.value!==namespaces.ontolex+'canonicalForm'));expect((await validator.validate(malformed)).conforms).toBe(false);
});
