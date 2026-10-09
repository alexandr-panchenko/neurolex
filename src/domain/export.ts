import { DataFactory, Writer } from 'n3';
import { richSchema } from './mock';
import type { DictionarySchema, Document, Field, Json } from './model';
const { namedNode, literal, quad } = DataFactory;
export const namespaces = { rdf:'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs:'http://www.w3.org/2000/01/rdf-schema#', skos:'http://www.w3.org/2004/02/skos/core#', ontolex:'http://www.w3.org/ns/lemon/ontolex#', lexicog:'http://www.w3.org/ns/lemon/lexicog#', dct:'http://purl.org/dc/terms/', prov:'http://www.w3.org/ns/prov#', xsd:'http://www.w3.org/2001/XMLSchema#' };
interface Node { '@id': string; [key: string]: Json }
export function text(value: Json | undefined): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value) && value.type === 'doc') { try { return richSchema.nodeFromJSON(value).textBetween(0,richSchema.nodeFromJSON(value).content.size,'\n'); } catch { return ''; } }
  return '';
}
export function exportGraph(doc: Document, schema: DictionarySchema, base: string) {
  const root = `${base}/id/article/${doc.id}`; const concept = `${base}/id/concept/${doc.id}`; const graph: Node[] = [];
  const article: Node = { '@id':root, '@type':namespaces.lexicog+'Entry', [namespaces.dct+'identifier']:doc.id };
  const conceptNode: Node = { '@id':concept,'@type':namespaces.skos+'Concept' }; graph.push(article,conceptNode,{ '@id':base+'/id/dictionary', '@type':namespaces.lexicog+'LexicographicResource', [namespaces.dct+'language']:['en','ru'], [namespaces.lexicog+'entry']:{ '@id':root } });
  const ref = (id: string): Json => ({ '@id':id });
  article[namespaces.lexicog+'describes'] = [];
  for (const [field,language] of [['term','en'],['equivalent','ru']] as const) {
    const entry = `${base}/id/entry/${doc.id}/${language}`; const form = entry+'/form'; const sense = entry+'/sense'; const label = text(doc.values[field]);
    (article[namespaces.lexicog+'describes'] as Json[]).push(ref(entry));
    graph.push({ '@id':entry,'@type':namespaces.ontolex+'LexicalEntry',[namespaces.dct+'language']:language,[namespaces.ontolex+'canonicalForm']:ref(form),[namespaces.ontolex+'sense']:ref(sense) }, { '@id':form,'@type':namespaces.ontolex+'Form',[namespaces.ontolex+'writtenRep']:{ '@value':label,'@language':language } }, { '@id':sense,'@type':namespaces.ontolex+'LexicalSense',[namespaces.ontolex+'reference']:ref(concept) });
    const key = namespaces.skos+'prefLabel'; const labels = conceptNode[key] as Json[] | undefined; conceptNode[key] = [...(labels || []),{ '@value':label,'@language':language }];
  }
  const abbreviation = text(doc.values.abbreviation);
  if (abbreviation) { const form = `${base}/id/entry/${doc.id}/en/abbreviation`; const entry = graph.find((n) => n['@id'] === `${base}/id/entry/${doc.id}/en`)!; entry[namespaces.ontolex+'otherForm'] = ref(form); graph.push({ '@id':form,'@type':namespaces.ontolex+'Form',[namespaces.ontolex+'writtenRep']:{ '@value':abbreviation,'@language':'en' } }); }
  function convert(f: Field, value: Json, id: string, language = 'ru'): Json {
    if (f.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
      if (typeof value.id === 'string') id = id.slice(0,id.lastIndexOf('/'))+'/'+encodeURIComponent(value.id);
      const node: Node = { '@id':id }; graph.push(node);
      for (const child of f.fields || []) { const v = value[child.id]; if (v !== undefined) node[child.predicate] = child.multiple && Array.isArray(v) ? v.map((item,i) => convert(child,item,`${id}/${child.id}/${i}`)) : convert(child,v,`${id}/${child.id}`,child.id === 'excerpt' && typeof value.language === 'string' ? value.language : language); }
      return ref(id);
    }
    if (f.type === 'reference' && typeof value === 'string') return ref(/^https?:/.test(value) ? value : `${base}/id/concept/${value}`);
    return f.type === 'richText' ? { '@value':text(value),'@language':language } : value;
  }
  for (const f of schema.fields) {
    if (['term','equivalent','abbreviation','externalMappings'].includes(f.id)) continue;
    const value = doc.values[f.id]; if (value === undefined) continue;
    const target = f.target === 'concept' ? conceptNode : article;
    target[f.predicate] = f.multiple && Array.isArray(value) ? value.map((v,i) => convert(f,v,`${root}/${f.id}/${i}`)) : convert(f,value,`${root}/${f.id}`);
  }
  if (Array.isArray(doc.values.externalMappings)) for (const mapping of doc.values.externalMappings) if (mapping && typeof mapping === 'object' && !Array.isArray(mapping) && typeof mapping.url === 'string' && ['exactMatch','closeMatch','relatedMatch'].includes(String(mapping.relation))) { const predicate = namespaces.skos+String(mapping.relation); const old = conceptNode[predicate] as Json[] | undefined; conceptNode[predicate] = [...(old || []),ref(mapping.url)]; }
  article[`${base}/vocabulary#schemaVersion`] = doc.schemaVersion;
  return { '@context':{ ...namespaces }, '@graph':graph };
}
export async function turtle(doc: Document, schema: DictionarySchema, base: string): Promise<string> {
  const graph = exportGraph(doc,schema,base)['@graph']; const writer = new Writer({ prefixes:namespaces });
  function term(value: Json) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (typeof value['@id'] === 'string') return namedNode(value['@id']);
      if (typeof value['@value'] === 'string') return literal(value['@value'],typeof value['@language'] === 'string' ? value['@language'] : '');
    }
    if (typeof value === 'number') return literal(String(value),namedNode(namespaces.xsd+(Number.isInteger(value) ? 'integer' : 'double')));
    if (typeof value === 'boolean') return literal(String(value),namedNode(namespaces.xsd+'boolean'));
    return literal(String(value ?? ''));
  }
  for (const node of graph) for (const [predicate,value] of Object.entries(node)) {
    if (predicate === '@id') continue; const values = Array.isArray(value) ? value : [value];
    for (const v of values) writer.addQuad(quad(namedNode(node['@id']),namedNode(predicate === '@type' ? namespaces.rdf+'type' : predicate),predicate === '@type' ? namedNode(String(v)) : term(v)));
  }
  return new Promise((resolve,reject) => writer.end((error,result) => error ? reject(error) : resolve(result)));
}
