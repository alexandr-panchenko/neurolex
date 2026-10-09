import { DomainError, object, own, requireScope, type Actor, type Change, type Document, type RecordEntry, type Revision, type Snapshot, type Values } from './model';
import { validateDocument, validateSchema } from './schema';
export function assertSchema(snapshot: Snapshot, version: unknown) { if (version !== snapshot.schema.version) throw new DomainError('SCHEMA_CONFLICT', 409, 'Структура словаря изменилась. Загрузите текущую версию.', { currentSchemaVersion: snapshot.schema.version }); }
function revised(document: Document, previous: RecordEntry | undefined, actor: Actor, action: string, publish = false): { record: RecordEntry; revision: Revision } {
  const revision = (previous?.revision || 0) + 1; const time = new Date().toISOString();
  return { record: { id: document.id, revision, current: document, published: publish ? document : previous?.published || null, publishedRevision: publish ? revision : previous?.publishedRevision || null, updatedAt: time }, revision: { document, revision, actor: actor.id, origin: actor.origin, time, action } };
}
export function writeDocument(snapshot: Snapshot, actor: Actor | null, input: unknown): Change {
  requireScope(actor, 'write');
  if (!object(input) || !object(input.document)) throw new DomainError('INVALID_INPUT', 400, 'Нужен документ и ожидаемая редакция.');
  assertSchema(snapshot, input.schemaVersion);
  const doc = validateDocument(snapshot.schema, input.document);
  const publish = input.publish === true;
  const previous = snapshot.records[doc.id];
  const sources = new Set(Array.isArray(doc.values.sources) ? doc.values.sources.flatMap((s) => object(s) && typeof s.id === 'string' ? [s.id] : []) : []);
  function links(value: unknown): void {
    if (Array.isArray(value)) { value.forEach(links); return; }
    if (!object(value)) return;
    if (value.type === 'term_ref' && object(value.attrs)) {
      const id = String(value.attrs.id); const target = snapshot.records[id];
      if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id) || (id !== doc.id && !target)) throw new DomainError('INVALID_REFERENCE',422,'Ссылка ведёт на неизвестную статью.', { id });
      if (publish && id !== doc.id && !target?.published) throw new DomainError('PRIVATE_REFERENCE',422,'Публичная статья не может ссылаться на частный черновик.', { id });
    }
    if (value.type === 'source_ref' && object(value.attrs) && !sources.has(String(value.attrs.id))) throw new DomainError('INVALID_REFERENCE',422,'Ссылка на источник отсутствует в списке источников.');
    Object.values(value).forEach(links);
  }
  links(doc.values);
  function references(fields: typeof snapshot.schema.fields, values: Values):void {
    for(const field of fields){const value=values[field.id];if(value===undefined)continue;const items=field.multiple?value as unknown[]:[value];for(const item of items){if(field.type==='object'&&object(item))references(field.fields||[],item as Values);if(field.type==='reference'&&field.target==='concept'&&typeof item==='string'&&!/^https?:/.test(item)){const target=snapshot.records[item];if(item!==doc.id&&!target)throw new DomainError('INVALID_REFERENCE',422,'Связанная статья не найдена.',{id:item});if(publish&&item!==doc.id&&!target?.published)throw new DomainError('PRIVATE_REFERENCE',422,'Связанная статья ещё не опубликована.',{id:item});}}}
  }
  references(snapshot.schema.fields,doc.values);

  if (input.expectedRevision !== (previous?.revision || 0)) throw new DomainError('REVISION_CONFLICT', 409, 'Статья была изменена. Ваш текст сохранён в редакторе.', { currentRevision: previous?.revision || 0, currentSchemaVersion: snapshot.schema.version });
  if (input.publish === true) requireScope(actor, 'publish');
  const { record, revision } = revised(doc, previous, actor, input.publish === true ? 'publish' : previous ? 'save-draft' : 'create-draft', input.publish === true);
  return { records: [record], revisions: [revision], result: record };
}
export interface Transform { op: 'rename' | 'set' | 'remove'; field?: string; from?: string; to?: string; value?: Values[string] }
export function migrationPreview(snapshot: Snapshot, input: unknown) {
  if (!object(input)) throw new DomainError('INVALID_INPUT', 400, 'Нужна новая структура.');
  assertSchema(snapshot, input.expectedSchemaVersion); validateSchema(input.schema);
  if (input.schema.version !== snapshot.schema.version + 1) throw new DomainError('INVALID_SCHEMA', 422, 'Версия должна увеличиваться на один.');
  const transformations = input.transformations ?? [];
  if (!Array.isArray(transformations) || transformations.length > 60) throw new DomainError('INVALID_MIGRATION', 422, 'Некорректные преобразования.');
  for (const t of transformations) if (!object(t) || !['rename','set','remove'].includes(String(t.op)) || [t.field,t.from,t.to].some((key) => key !== undefined && (typeof key !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(key) || ['__proto__','constructor','prototype'].includes(key)))) throw new DomainError('INVALID_MIGRATION', 422, 'Поддерживаются только rename, set, remove.');
  const schema = input.schema;
  const transform = (doc: Document): Document => {
    const updated = structuredClone(doc); updated.schemaVersion = schema.version;
    for (const t of transformations as Transform[]) {
      if (t.op === 'rename') { if (!t.from || !t.to) throw new DomainError('INVALID_MIGRATION', 422, 'rename требует from и to.'); if (own(updated.values,t.from)) { if (own(updated.values,t.to)) throw new DomainError('INVALID_MIGRATION',422,'Новое поле уже содержит значение.', { field:t.to }); updated.values[t.to] = updated.values[t.from]!; delete updated.values[t.from]; } }
      if (t.op === 'set') { if (!t.field || t.value === undefined) throw new DomainError('INVALID_MIGRATION',422,'set требует field и value.'); if (!own(updated.values,t.field)) updated.values[t.field] = t.value; }
      if (t.op === 'remove') { if (!t.field) throw new DomainError('INVALID_MIGRATION',422,'remove требует field.'); delete updated.values[t.field]; }
    }
    return validateDocument(schema, updated);
  };
  const failures: { id: string; surface: string; details: unknown }[] = []; const records: RecordEntry[] = [];
  for (const record of Object.values(snapshot.records)) {
    let current: Document | null = null; let published: Document | null = null;
    for (const [surface, doc] of [['current',record.current],['published',record.published]] as const) {
      if (!doc) continue;
      try { const transformed = transform(doc); if (surface === 'current') current = transformed; else published = transformed; }
      catch (e) { if (!(e instanceof DomainError)) throw e; failures.push({ id:record.id,surface,details:e.details || e.message }); }
    }
    if (current) records.push({ ...record, current, published });
  }
  return { schema, records, failures, affected: Object.keys(snapshot.records).length, corpusVersion: snapshot.version };
}
export function applyMigration(snapshot: Snapshot, actor: Actor | null, input: unknown): Change {
  requireScope(actor, 'schema');
  if (!object(input) || input.expectedCorpusVersion !== snapshot.version) throw new DomainError('CORPUS_CONFLICT',409,'Словарь изменился после предварительного просмотра.', { currentCorpusVersion: snapshot.version });
  const preview = migrationPreview(snapshot,input);
  if (preview.failures.length) throw new DomainError('MIGRATION_VALIDATION',422,'Миграция не применена: исправьте ошибки.',preview.failures);
  const records: RecordEntry[] = []; const revisions: Revision[] = [];
  for (const migrated of preview.records) {
    const { record, revision } = revised(migrated.current, snapshot.records[migrated.id], actor, 'schema-migration');
    records.push({ ...record, published: migrated.published, publishedRevision: migrated.published && snapshot.records[migrated.id]?.revision === snapshot.records[migrated.id]?.publishedRevision ? record.revision : record.publishedRevision }); revisions.push(revision);
  }
  return { schema: preview.schema, records, revisions, result: { schemaVersion: preview.schema.version, affected: records.length } };
}
