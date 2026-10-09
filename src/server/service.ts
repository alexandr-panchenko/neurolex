import { DomainError, object, requireScope, type Actor, type Change, type Document, type RecordEntry } from '../domain/model';
import { applyMigration, assertSchema, migrationPreview, writeDocument } from '../domain/operations';
import { jsonSchema, validateDocument } from '../domain/schema';
import { text } from '../domain/export';
import { searchScore } from '../domain/query';
import { Store, digest } from './store';
export class Service {
  constructor(public store: Store, public actor: Actor | null) {}
  async readSchema() { const s = await this.store.snapshot(); return { schema:s.schema,jsonSchema:jsonSchema(s.schema),corpusVersion:s.version }; }
  async list(query = '', category = '', privateView = false) {
    if (privateView) requireScope(this.actor,'read'); const s = await this.store.snapshot();
    const q = query.trim().toLocaleLowerCase();
    const docs = Object.values(s.records).flatMap((r) => { const doc = privateView ? r.current : r.published; return doc ? [{ id:r.id,revision:privateView ? r.revision : r.publishedRevision,document:doc,status:privateView && r.revision !== r.publishedRevision ? 'draft' : 'published' }] : []; });
    const score = (doc: Document) => searchScore(doc,q);
    return { schema:s.schema,corpusVersion:s.version, articles:docs.filter((r) => (!category || r.document.values.category === category) && (!q || score(r.document)>0)).sort((a,b) => q ? score(b.document)-score(a.document) : text(a.document.values.term).localeCompare(text(b.document.values.term))) };
  }
  async read(id: string, privateView = false) {
    if (privateView) requireScope(this.actor,'read'); const snapshot = await this.store.snapshot(); const record = snapshot.records[id];
    if (!record || (!privateView && !record.published)) throw new DomainError('NOT_FOUND',404,'Статья не найдена.');
    return privateView ? record : { id:record.id,revision:record.publishedRevision,document:record.published };
  }
  async history(id: string) { requireScope(this.actor,'read'); return this.store.history(id); }
  async mutate(operation: string, input: unknown, key?: string) {
    requireScope(this.actor,operation.startsWith('schema') ? 'schema' : 'write'); const actor = this.actor;
    if (key && (key.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(key))) throw new DomainError('INVALID_IDEMPOTENCY_KEY',400,'Некорректный ключ повтора.');
    const requestHash = await digest(JSON.stringify({ operation,input }));
    if (key) { const receipt = await this.store.receipt(actor.id,key); if (receipt) { if (receipt.request_hash !== requestHash) throw new DomainError('IDEMPOTENCY_CONFLICT',409,'Ключ уже использован для другого запроса.'); return JSON.parse(receipt.body) as unknown; } }
    const snapshot = await this.store.snapshot(); let change: Change;
    switch (operation) {
      case 'write': change = writeDocument(snapshot,actor,input); break;
      case 'restore': {
        if (!object(input) || typeof input.id !== 'string' || !Number.isInteger(input.revision)) throw new DomainError('INVALID_INPUT',400,'Нужны статья и редакция.');
        const revision = await this.store.revision(input.id,Number(input.revision)); if (!revision) throw new DomainError('NOT_FOUND',404,'Редакция не найдена.');
        change = writeDocument(snapshot,actor,{ ...input, document:{ ...revision.document,schemaVersion:snapshot.schema.version },publish:false }); break;
      }
      case 'schema.apply': change = applyMigration(snapshot,actor,input); break;
      case 'import': {
        if (!object(input) || !Array.isArray(input.documents) || input.documents.length>100) throw new DomainError('INVALID_INPUT',400,'Импорт принимает до 100 документов.');
        assertSchema(snapshot,input.schemaVersion); const records: RecordEntry[] = []; const revisions = []; const seen = new Set();
        for (const doc of input.documents) {
          const valid = validateDocument(snapshot.schema,doc); if (seen.has(valid.id)) throw new DomainError('DUPLICATE',422,'Повтор идентификатора в пакете.'); seen.add(valid.id);
          const existing = snapshot.records[valid.id];
          // Existing author values win on reimport; explicit edits use write with expectedRevision.
          let merged = existing ? { ...valid,values:{ ...valid.values,...existing.current.values } } : valid;
          const replacements=object(input.replaceFields)?input.replaceFields[valid.id]:undefined;
          if(existing&&Array.isArray(replacements)&&replacements.length){
            const expected=object(input.expectedRevisions)?input.expectedRevisions[valid.id]:undefined;
            if(expected!==existing.revision)throw new DomainError('REVISION_CONFLICT',409,'Статья изменилась после просмотра импорта.',{id:valid.id,currentRevision:existing.revision});
            if(replacements.some(field=>typeof field!=='string'||!Object.hasOwn(valid.values,field)))throw new DomainError('INVALID_INPUT',422,'Заменять можно только поля из импортируемой статьи.');
            merged={...merged,values:{...merged.values,...Object.fromEntries(replacements.map(field=>[field,valid.values[field as string]!]))}};
          }
          const one = writeDocument(snapshot,{ ...actor,origin:'import' },{ document:merged,schemaVersion:input.schemaVersion,expectedRevision:existing?.revision || 0,publish:input.publish === true }); records.push(...one.records); revisions.push(...one.revisions);
        }
        change = { records,revisions,result:{ outcomes:records.map((r) => ({ id:r.id,revision:r.revision,retainedLocalValues:!!snapshot.records[r.id] })) } }; break;
      }
      default: throw new DomainError('UNKNOWN_OPERATION',400,'Операция не поддерживается.');
    }
    try { await this.store.commit(snapshot,change,actor.id,key ? { actor:actor.id,key,requestHash,body:change.result } : undefined); }
    catch (error) { if (key && error instanceof DomainError && error.code === 'CORPUS_CONFLICT') { const receipt = await this.store.receipt(actor.id,key); if (receipt?.request_hash === requestHash) return JSON.parse(receipt.body) as unknown; } throw error; }
    return change.result;
  }
  async preview(input: unknown) { requireScope(this.actor,'schema'); return migrationPreview(await this.store.snapshot(),input); }
  async importPreview(input: unknown) {
    requireScope(this.actor,'write'); const s = await this.store.snapshot(); if (!object(input) || !Array.isArray(input.documents)) throw new DomainError('INVALID_INPUT',400,'Нужен массив documents.');
    assertSchema(s,input.schemaVersion);if(input.documents.length>100)throw new DomainError('INVALID_INPUT',400,'Импорт принимает до 100 документов.');const seen=new Set<string>();
    return { outcomes:input.documents.map((raw) => { try { const doc = validateDocument(s.schema,raw);if(seen.has(doc.id))throw new DomainError('DUPLICATE',422,'Повтор идентификатора в пакете.',{id:doc.id});seen.add(doc.id); const old = s.records[doc.id]; return { id:doc.id,exists:!!old,revision:old?.revision||0,retainedLocalFields:old ? Object.keys(old.current.values) : [], incomingFields:Object.keys(doc.values),differences:Object.entries(doc.values).filter(([field,value])=>JSON.stringify(old?.current.values[field])!==JSON.stringify(value)).map(([field,value])=>({field,current:old?.current.values[field]??null,incoming:value})) }; } catch (e) { if (!(e instanceof DomainError)) throw e; return { error:e.code,details:e.details }; } }) };
  }
}
