import {expect,test} from 'bun:test';
import {database} from './db';
import {Store} from '../src/server/store';
import {Service} from '../src/server/service';
import {applyMigration,writeDocument,migrationPreview} from '../src/domain/operations';
import {initialSchema,validateDocument} from '../src/domain/schema';
import {paragraph} from '../src/domain/mock';
import type {Actor,Document} from '../src/domain/model';
const actor:Actor={id:'author:test',origin:'browser',scopes:['read','write','publish','schema']};
async function setup(){const store=new Store(database());return {store,service:new Service(store,actor),snapshot:await store.snapshot()};}
test('save draft preserves published content, revision history and optimistic conflicts',async()=>{
 const {store,service,snapshot}=await setup();const before=snapshot.records.neurofeedback!;const document={...before.current,values:{...before.current.values,equivalent:'Изменённый черновик'}};
 await service.mutate('write',{document,expectedRevision:1,schemaVersion:1},'first');
 const published=await new Service(store,null).read('neurofeedback');expect('document'in published&&published.document?.values.equivalent).toBe('нейрообратная связь');
 expect((await service.history('neurofeedback'))).toHaveLength(2);
 await expect(service.mutate('write',{document,expectedRevision:1,schemaVersion:1})).rejects.toMatchObject({code:'REVISION_CONFLICT'});
 await expect(service.mutate('write',{document,expectedRevision:2,schemaVersion:99})).rejects.toMatchObject({code:'SCHEMA_CONFLICT'});
 expect((await store.snapshot()).records.neurofeedback!.revision).toBe(2);
});
test('idempotency returns the original result and rejects changed payload',async()=>{
 const {service,snapshot}=await setup();const input={document:snapshot.records.neurofeedback!.current,expectedRevision:1,schemaVersion:1};
 const first=await service.mutate('write',input,'repeat');expect(await service.mutate('write',input,'repeat')).toEqual(first);
 await expect(service.mutate('write',{...input,publish:true},'repeat')).rejects.toMatchObject({code:'IDEMPOTENCY_CONFLICT'});
});
test('optional field propagates through schema and validation; schema drift prevents a stale write',async()=>{
 const {service,store,snapshot}=await setup();const schema={...initialSchema,version:2,fields:[...initialSchema.fields,{id:'discourseFunction',label:'Дискурсивная функция',description:'Role in discourse',section:'Термин в дискурсе',type:'text' as const,target:'article' as const,predicate:'https://example.org/discourseFunction',multiple:true}]};
 const input={schema,expectedSchemaVersion:1,transformations:[],expectedCorpusVersion:snapshot.version};expect((await service.preview(input)).failures).toHaveLength(0);await service.mutate('schema.apply',input);
 const next=await store.snapshot();const document={...next.records.neurofeedback!.current,values:{...next.records.neurofeedback!.current.values,discourseFunction:['explanation']}};expect(validateDocument(next.schema,document).values.discourseFunction).toEqual(['explanation']);
 expect((await service.history('neurofeedback'))[1]!.document.schemaVersion).toBe(1);
 await expect(service.mutate('write',{document:snapshot.records.neurofeedback!.current,expectedRevision:1,schemaVersion:1})).rejects.toMatchObject({code:'SCHEMA_CONFLICT'});
});
test('migration validation and stale corpus protection leave all records unchanged',async()=>{
 const {service,store,snapshot}=await setup();const schema={...initialSchema,version:2,fields:[...initialSchema.fields,{id:'requiredNew',label:'Обязательное поле',description:'Required',section:'Анализ',type:'text' as const,target:'article' as const,predicate:'https://example.org/required',required:true}]};
 const input={schema,expectedSchemaVersion:1,expectedCorpusVersion:snapshot.version,transformations:[]};expect(migrationPreview(snapshot,input).failures.length).toBeGreaterThan(0);
 await expect(service.mutate('schema.apply',input)).rejects.toMatchObject({code:'MIGRATION_VALIDATION'});expect(await store.snapshot()).toEqual(snapshot);
 expect(()=>applyMigration(snapshot,actor,{...input,expectedCorpusVersion:99})).toThrow();
});
test('SQLite transaction guard rolls back an entire stale commit, including revision insert',async()=>{
 const {store,snapshot}=await setup();const input={document:snapshot.records.neurofeedback!.current,expectedRevision:1,schemaVersion:1};
 const change=writeDocument(snapshot,actor,input);await store.commit(snapshot,change,actor.id);
 await expect(store.commit(snapshot,change,actor.id)).rejects.toMatchObject({code:'CORPUS_CONFLICT'});
 expect((await store.history('neurofeedback'))).toHaveLength(2);expect((await store.snapshot()).version).toBe(1);
});
test('reimport preserves author additions and new articles remain private',async()=>{
 const {service,store,snapshot}=await setup();const old=snapshot.records.neurofeedback!.current;const imported={...old,values:{...old.values,equivalent:'External replacement',newOptional:'Added external fact'}};
 const newDoc:Document={...old,id:'private-new',values:{...old.values,term:'Secret draft'}};
 await service.mutate('import',{documents:[imported,newDoc],schemaVersion:1},'import');
 const next=await store.snapshot();expect(next.records.neurofeedback!.current.values.equivalent).toBe(old.values.equivalent);expect(next.records.neurofeedback!.current.values.newOptional).toBe('Added external fact');
 expect((await new Service(store,null).list()).articles.some((a)=>a.id==='private-new')).toBe(false);
});
test('unsafe links and invented attestation are rejected',()=>{
 const doc:Document={id:'test',schemaVersion:1,values:{term:'Test',equivalent:'Тест',definition:paragraph('Definition'),examples:[{excerpt:paragraph('Quote'),evidence:'attested'}]}};
 expect(()=>validateDocument(initialSchema,doc)).toThrow();
 doc.values.examples=[];doc.values.definition={type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'bad',marks:[{type:'link',attrs:{href:'javascript:alert(1)'}}]}]}]};expect(()=>validateDocument(initialSchema,doc)).toThrow();
});
test('published term references cannot expose a private target',async()=>{
 const {service,snapshot}=await setup();const source=snapshot.records.neurofeedback!.current;const privateDoc={...source,id:'private-ref'};
 await service.mutate('write',{document:privateDoc,schemaVersion:1,expectedRevision:0});
 const analysis={type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Private term',marks:[{type:'term_ref',attrs:{id:'private-ref'}}]}]}]};
 await expect(service.mutate('write',{document:{...source,values:{...source.values,analysis}},schemaVersion:1,expectedRevision:1,publish:true})).rejects.toMatchObject({code:'PRIVATE_REFERENCE'});
});
test('new article topic survives an atomic compatible migration and stays private until publication',async()=>{
 const {service,store,snapshot}=await setup();const schema={...initialSchema,version:2,fields:initialSchema.fields.map(f=>f.id==='category'?{...f,type:'text' as const}:f)};
 await service.mutate('schema.apply',{schema,expectedSchemaVersion:1,expectedCorpusVersion:snapshot.version,transformations:[]});const updated=await store.snapshot();const current=updated.records.neurofeedback!;
 const document={...current.current,values:{...current.current.values,category:'Новый раздел'}};await service.mutate('write',{document,schemaVersion:2,expectedRevision:current.revision});
 expect((await service.list('','Новый раздел',true)).articles).toHaveLength(1);expect((await new Service(store,null).list('','Новый раздел')).articles).toHaveLength(0);
 const saved=(await store.snapshot()).records.neurofeedback!;await service.mutate('write',{document,schemaVersion:2,expectedRevision:saved.revision,publish:true});expect((await new Service(store,null).list('','Новый раздел')).articles).toHaveLength(1);
});
