import { Parser, Store } from 'n3';
import { DomainError, type DictionarySchema, type Document, type Json } from '../domain/model';
import { meshDocument } from './mesh';
export const snapshotCommit='e0b6941924a5dabcd62c5cab879e9b8c64571e4a';
const sourceBase='https://raw.githubusercontent.com/SciCrunch/NIF-Ontology/'+snapshotCommit+'/';
export const moduleUrl=sourceBase+'ttl/NIF-Investigation.ttl';
export const mappingUrl=sourceBase+'ttl/generated/NIFSTD-ILX-mapping.ttl';
const nif='http://uri.neuinfo.org/nif/nifstd/';
const readable=nif+'readable/';
async function graph(url:string,fetcher:typeof fetch){
 let response:Response;try{response=await fetcher(url,{signal:AbortSignal.timeout(20000),redirect:'manual'});}catch{throw new DomainError('SOURCE_UNAVAILABLE',502,'Источник NeuroLex временно недоступен.');}
 if(!response.ok||!response.body)throw new DomainError('SOURCE_ERROR',502,'Не удалось получить RDF NeuroLex.',{status:response.status});
 const reader=response.body.getReader();let size=0;const chunks:Uint8Array[]=[];
 while(true){const next=await reader.read();if(next.done)break;size+=next.value.byteLength;if(size>1500000){await reader.cancel();throw new DomainError('SOURCE_TOO_LARGE',422,'RDF превышает ограничение размера.');}chunks.push(next.value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{return new Store(new Parser({format:'Turtle'}).parse(new TextDecoder().decode(bytes)));}catch{throw new DomainError('SOURCE_FORMAT',502,'Источник вернул некорректный Turtle.');}
}
export async function interlexRecord(id:string,fetcher:typeof fetch=fetch){
 if(!/^(nlx(_inv)?_\d{4,12}|birnlex_\d{1,8}|ilx_\d{7})$/.test(id))throw new DomainError('INVALID_INTERLEX_ID',422,'Укажите NeuroLex или InterLex ID, например nlx_inv_090919 или ilx_0107518.');
 const [ontology,mapping]=await Promise.all([graph(moduleUrl,fetcher),graph(mappingUrl,fetcher)]);
 const mappingPredicate='http://uri.interlex.org/tgbugs/uris/readable/hasIlxId';
 const matches=id.startsWith('ilx_')?mapping.getQuads(null,mappingPredicate,'http://uri.interlex.org/base/'+id,null):[];
 if(matches.length>1)throw new DomainError('SOURCE_AMBIGUOUS',422,'InterLex ID соответствует нескольким исходным записям. Укажите NeuroLex ID.');
 const source=id.startsWith('ilx_')?matches[0]?.subject.value:nif+id;
 if(!source||!ontology.countQuads(source,null,null,null))throw new DomainError('SOURCE_NOT_FOUND',404,'Запись отсутствует в модуле методов NeuroLex/NIFSTD.');
 const values=(predicate:string)=>ontology.getQuads(source,predicate,null,null).map(q=>q.object.value);
 const label=values('http://www.w3.org/2004/02/skos/core#prefLabel')[0]||values('http://www.w3.org/2000/01/rdf-schema#label')[0];
 const definitions=values('http://www.w3.org/2004/02/skos/core#definition');
 if(!definitions.length)definitions.push(...values(readable+'birnlexDefinition'));
 if(!label||definitions.length!==1)throw new DomainError('SOURCE_INCOMPLETE',422,'Для импорта нужно одно явно указанное определение. В этой записи оно отсутствует или неоднозначно.');
 const ilx=mapping.getQuads(source,mappingPredicate,null,null).map(q=>q.object.value);
 const statements=ontology.getQuads(source,null,null,null).map(q=>({predicate:q.predicate.value,value:q.object.value,kind:q.object.termType,...(q.object.termType==='Literal'?{language:q.object.language,datatype:q.object.datatype.value}:{})}));
 return {id:source.slice(nif.length),label,definition:definitions[0]!,source,interlex:ilx,statements,snapshotCommit,moduleUrl,mappingUrl,retrievedAt:new Date().toISOString(),licenseUrl:'https://creativecommons.org/licenses/by/4.0/',synonyms:values(readable+'synonym'),citations:[...values(readable+'definingCitation'),...values(readable+'definingCitationURI')],contributors:values('http://purl.org/dc/elements/1.1/contributor')};
}
export function interlexDocument(record:Awaited<ReturnType<typeof interlexRecord>>,equivalent:string,schema:DictionarySchema):Document{
 const document=meshDocument({...record,descriptorUrl:record.source,conceptUrl:record.source,lastUpdated:snapshotCommit},equivalent,schema);
 document.id='neurolex-'+record.id.replaceAll('_','-');
 const sources=schema.fields.find(f=>f.type==='object'&&f.multiple&&f.predicate==='http://purl.org/dc/terms/source')!;
 const source:Record<string,Json>={};for(const field of sources.fields||[]){if(field.predicate==='http://purl.org/dc/terms/identifier')source[field.id]='neurolex-'+record.id;if(field.predicate==='http://purl.org/dc/terms/title')source[field.id]='NeuroLex / NIFSTD · '+record.label;if(field.predicate==='http://www.w3.org/2000/01/rdf-schema#seeAlso')source[field.id]=record.moduleUrl;if(field.predicate==='http://purl.org/dc/terms/license')source[field.id]=record.licenseUrl;if(field.predicate.endsWith('#sourceNote'))source[field.id]='SciCrunch · NeuroLex / NIFSTD, CC BY 4.0. Original record: '+record.source+'. InterLex: '+record.interlex.join(', ')+'.'+(record.contributors.length?' Contributors: '+record.contributors.join(', ')+'.':'')+(record.citations.length?' Original citations: '+record.citations.join('; ')+'.':'');}
 document.values[sources.id]=[source];
 document.values.externalRecord={provider:'NeuroLex / NIFSTD',...record} as unknown as Json;
 // Identifier correspondence supplied by the source is provenance, not inferred SKOS identity.
 return document;
}
