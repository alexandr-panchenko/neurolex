import { DomainError, object, type Field, type DictionarySchema, type Document } from './model';
import { richSchema } from './mock';
import { initialSchema } from './schema-definition';
export { initialSchema };
function fieldShape(f: Field): Record<string, unknown> {
  let shape: Record<string, unknown>;
  switch (f.type) {
    case 'richText': shape = { type: 'object', required: ['type', 'content'], properties: { type: { const: 'doc' }, content: { type: 'array' }, attrs: { type: 'object', properties: { language: { anyOf: [{type:'null'},{type:'string',pattern:'^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'}] } } } } }; break;
    case 'object': shape = { type: 'object', properties: Object.fromEntries((f.fields || []).map((c) => [c.id, fieldShape(c)])), required: (f.fields || []).filter((c) => c.required).map((c) => c.id), additionalProperties: true }; break;
    case 'enum': shape = { type: 'string', enum: f.options }; break;
    case 'date': shape = { type: 'string', format: 'date' }; break;
    case 'number': shape = { type: 'number' }; break;
    case 'boolean': shape = { type: 'boolean' }; break;
    default: shape = { type: 'string', ...(f.required ? { minLength: 1, pattern: '\\S' } : {}), ...(f.type === 'reference' ? { pattern: '^(https?://[^\\s]+|[a-z0-9][a-z0-9-]{0,79})$' } : {}) };
  }
  return f.multiple ? { type: 'array', items: shape, maxItems: 100, ...(f.required ? { minItems: 1 } : {}) } : shape;
}
export function jsonSchema(schema: DictionarySchema) {
  return { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', required: ['id', 'schemaVersion', 'values'], additionalProperties: false,
    properties: { id: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{0,79}$' }, schemaVersion: { const: schema.version }, values: { type: 'object', properties: Object.fromEntries(schema.fields.map((f) => [f.id, fieldShape(f)])), required: schema.fields.filter((f) => f.required).map((f) => f.id), additionalProperties: true } } };
}
export function validateSchema(schema: unknown): asserts schema is DictionarySchema {
  if (!object(schema) || !Number.isInteger(schema.version) || !Number.isInteger(schema.contextVersion) || !Array.isArray(schema.fields) || !Array.isArray(schema.categories)) throw new DomainError('INVALID_SCHEMA', 422, 'Некорректная структура словаря.');
  const ids = new Set<string>();
  function check(fields: unknown[], depth: number) {
    if (depth > 4 || fields.length > 60) throw new DomainError('INVALID_SCHEMA', 422, 'Превышена сложность структуры.');
    const local = new Set();
    for (const f of fields) {
      if (!object(f) || typeof f.id !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(f.id) || ['constructor', 'prototype', '__proto__'].includes(f.id) || local.has(f.id) || typeof f.label !== 'string' || !f.label.trim() || typeof f.description !== 'string' || typeof f.section !== 'string' || !['text','richText','number','boolean','date','enum','reference','object'].includes(String(f.type)) || !['article', 'concept'].includes(String(f.target)) || typeof f.predicate !== 'string' || !/^https?:\/\/[^\s]+$/.test(f.predicate)) throw new DomainError('INVALID_SCHEMA', 422, 'Проверьте идентификаторы, типы и семантические свойства полей.');
      local.add(f.id); if (!depth) ids.add(f.id);
      if (f.type === 'enum' && (!Array.isArray(f.options) || !f.options.length || !f.options.every((v) => typeof v === 'string'))) throw new DomainError('INVALID_SCHEMA', 422, 'Перечислению нужны допустимые значения.');
      if (f.type === 'object') { if (!Array.isArray(f.fields)) throw new DomainError('INVALID_SCHEMA', 422, 'Группе нужны вложенные поля.'); check(f.fields, depth + 1); }
    }
  }
  check(schema.fields, 0);
  for (const id of ['term', 'equivalent', 'definition']) if (!ids.has(id)) throw new DomainError('INVALID_SCHEMA', 422, 'Основные лексические поля нельзя удалить.', { field: id });
  for (const f of schema.fields as Field[]) if (['term', 'equivalent'].includes(f.id) && (f.type !== 'text' || f.multiple || !f.required)) throw new DomainError('INVALID_SCHEMA', 422, 'Лексические названия должны оставаться обязательным текстом.');
}
export function validateDocument(schema: DictionarySchema, input: unknown): Document {
  if (!object(input) || typeof input.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(input.id) || input.schemaVersion !== schema.version || !object(input.values) || Object.keys(input).some((key) => !['id','schemaVersion','values'].includes(key))) throw new DomainError('VALIDATION',422,'Некорректная оболочка документа.');
  const doc = input as unknown as Document;
  const invalid = (path: string, label: string): never => { throw new DomainError('VALIDATION',422,'Проверьте поле: '+label,[{ instancePath:path }]); };
  function shape(fields: Field[], values: Record<string,unknown>, path: string): void {
    for (const f of fields) {
      const value=values[f.id]; const at=path+'/'+f.id;
      if (value===undefined) { if(f.required)invalid(at,f.label); continue; }
      if (f.multiple && (!Array.isArray(value) || value.length>100 || (f.required && !value.length))) invalid(at,f.label);
      const items=f.multiple?value as unknown[]:[value];
      for (const [i,item] of items.entries()) {
        const location=f.multiple?at+'/'+i:at;
        switch(f.type) {
          case 'object': if(!object(item))invalid(location,f.label);shape(f.fields||[],item as Record<string,unknown>,location);break;
          case 'richText': if(!object(item)||item.type!=='doc'||!Array.isArray(item.content))invalid(location,f.label);break;
          case 'number': if(typeof item!=='number'||!Number.isFinite(item))invalid(location,f.label);break;
          case 'boolean': if(typeof item!=='boolean')invalid(location,f.label);break;
          default:
            if(typeof item!=='string'||(f.required && !item.trim()))invalid(location,f.label);
            if(f.type==='enum'&&!f.options?.includes(item as string))invalid(location,f.label);
            if(f.type==='reference'&&!/^(https?:\/\/[^\s]+|[a-z0-9][a-z0-9-]{0,79})$/.test(item as string))invalid(location,f.label);
            if(f.type==='date') { const value=String(item);const date=new Date(value+'T00:00:00.000Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(date.valueOf())||date.toISOString().slice(0,10)!==value)invalid(location,f.label); }
        }
      }
    }
  }
  shape(schema.fields,doc.values,'/values');
  if (new TextEncoder().encode(JSON.stringify(doc)).byteLength > 65536) throw new DomainError('TOO_LARGE', 413, 'Статья превышает ограничение 64 КБ.');
  function check(fields: Field[], values: Record<string, unknown>, path: string) {
    for (const f of fields) {
      const val = values[f.id]; if (val === undefined) continue;
      const items = f.multiple ? val as unknown[] : [val];
      for (const [i, item] of items.entries()) {
        const at = `${path}/${f.id}${f.multiple ? '/' + i : ''}`;
        if (f.type === 'richText') {
          if(object(item)&&object(item.attrs)&&item.attrs.language!==undefined&&item.attrs.language!==null&&(typeof item.attrs.language!=='string'||!/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(item.attrs.language)))invalid(at+'/attrs/language',f.label);
          try { const node = richSchema.nodeFromJSON(item); node.check(); if (f.required && !node.textContent.trim()) throw new Error(); }
          catch { throw new DomainError('VALIDATION', 422, 'Некорректный форматированный текст.', [{ instancePath: at }]); }
          const visit = (value: unknown): void => { if (object(value)) { if (value.type === 'image') throw new DomainError('VALIDATION', 422, 'Изображения не входят в поддерживаемый формат статьи.', [{ instancePath: at }]); if (value.type === 'link' && object(value.attrs) && !/^https?:\/\//.test(String(value.attrs.href))) throw new DomainError('VALIDATION', 422, 'Разрешены только безопасные HTTP(S)-ссылки.', [{ instancePath: at }]); for (const v of Object.values(value)) visit(v); } else if (Array.isArray(value)) value.forEach(visit); }; visit(item);
        }
        if (f.type === 'object' && object(item)) {
          check(f.fields || [], item, at);
          if (item.evidence === 'attested' && (!item.url || !item.transcriptProvenance)) throw new DomainError('VALIDATION', 422, 'Засвидетельствованному фрагменту нужны URL и происхождение транскрипта.', [{ instancePath: at }]);
          if (typeof item.start === 'number' && (item.start < 0 || (typeof item.end === 'number' && item.end < item.start))) throw new DomainError('VALIDATION', 422, 'Проверьте таймкоды.', [{ instancePath: at }]);
        }
      }
    }
  }
  check(schema.fields, doc.values, '/values'); return structuredClone(doc);
}
