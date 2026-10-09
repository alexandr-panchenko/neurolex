import { DomainError, object, type Actor } from '../domain/model';
import { Service } from './service';
const descriptors = [
  ['schema_get','Read the active schema and JSON Schema before writing.',null],
  ['articles_search','Search published articles; q and category are optional.',null],
  ['article_read','Read a published article by id. Set privateView only with read permission.',null],
  ['article_history','Read private revision history by id.','read'],
  ['document_write','Create/update a draft, or publish when permitted. Fetch schema and revision first.','write'],
  ['import_preview','Preview validated documents and duplicate preservation.','write'],
  ['import_apply','Import documents as drafts by default; local additions take precedence on reimport.','write'],
  ['schema_preview','Preview a next-version schema and declarative transformations.','schema'],
  ['schema_apply','Atomically apply a previewed schema with expected corpus and schema versions.','schema'],
] as const;
function inputSchema(name: string) {
  const properties: Record<string, unknown> = { idempotencyKey: { type: 'string' } };
  let required: string[] = [];
  if (name === 'articles_search') Object.assign(properties,{ q:{type:'string'},category:{type:'string'} });
  if (['article_read','article_history'].includes(name)) { Object.assign(properties,{ id:{type:'string'},privateView:{type:'boolean'} });required=['id']; }
  if (name === 'document_write') { Object.assign(properties,{ document:{type:'object',additionalProperties:true},schemaVersion:{type:'integer'},expectedRevision:{type:'integer'},publish:{type:'boolean'} });required=['document','schemaVersion','expectedRevision']; }
  if (name.startsWith('import_')) { Object.assign(properties,{ documents:{type:'array',items:{type:'object',additionalProperties:true}},schemaVersion:{type:'integer'},publish:{type:'boolean'} });required=['documents','schemaVersion']; }
  if (name.startsWith('schema_') && name !== 'schema_get') { Object.assign(properties,{ schema:{type:'object',additionalProperties:true},expectedSchemaVersion:{type:'integer'},expectedCorpusVersion:{type:'integer'},transformations:{type:'array',items:{type:'object',additionalProperties:true}} });required=['schema','expectedSchemaVersion'];if(name==='schema_apply')required.push('expectedCorpusVersion'); }
  return { type:'object',properties,required,additionalProperties:true };
}
export async function mcp(service: Service, actor: Actor | null, body: unknown) {
  if (!object(body) || body.jsonrpc !== '2.0' || typeof body.method !== 'string') return { jsonrpc:'2.0',id:null,error:{ code:-32600,message:'Invalid JSON-RPC request' } };
  if (body.id === undefined) return null;
  const envelope = { jsonrpc:'2.0',id:body.id };
  if (body.method === 'initialize') return { ...envelope,result:{ protocolVersion:'2025-06-18',capabilities:{ tools:{ listChanged:false } },serverInfo:{ name:'neurolex',version:'0.1.0' },instructions:'Read schema_get before every write. Drafts are private. Use expectedRevision and schemaVersion; conflicts must be reevaluated.' } };
  if (body.method === 'ping') return { ...envelope,result:{} };
  if (body.method === 'tools/list') return { ...envelope,result:{ tools:descriptors.filter((d) => !d[2] || actor?.scopes.includes(d[2])).map(([name,description]) => ({ name,description,inputSchema:inputSchema(name),annotations:{ readOnlyHint:['schema_get','articles_search','article_read','article_history','schema_preview','import_preview'].includes(name) } })) } };
  if (body.method !== 'tools/call' || !object(body.params)) return { ...envelope,error:{ code:-32601,message:'Method not found' } };
  const input = object(body.params.arguments) ? body.params.arguments : {};
  let result: unknown;
  try {
    switch (body.params.name) {
      case 'schema_get': result = await service.readSchema(); break;
      case 'articles_search': result = await service.list(String(input.q || ''),String(input.category || '')); break;
      case 'article_read': result = await service.read(String(input.id || ''),input.privateView === true); break;
      case 'article_history': result = await service.history(String(input.id || '')); break;
      case 'document_write': result = await service.mutate('write',input,typeof input.idempotencyKey === 'string' ? input.idempotencyKey : undefined); break;
      case 'import_preview': result = await service.importPreview(input); break;
      case 'import_apply': result = await service.mutate('import',input,typeof input.idempotencyKey === 'string' ? input.idempotencyKey : undefined); break;
      case 'schema_preview': result = await service.preview(input); break;
      case 'schema_apply': result = await service.mutate('schema.apply',input,typeof input.idempotencyKey === 'string' ? input.idempotencyKey : undefined); break;
      default: return { ...envelope,error:{ code:-32602,message:'Unknown tool' } };
    }
    return { ...envelope,result:{ content:[{ type:'text',text:JSON.stringify(result) }],structuredContent:object(result) ? result : { result } } };
  } catch (e) { if (!(e instanceof DomainError)) throw e; return { ...envelope,result:{ isError:true,content:[{ type:'text',text:JSON.stringify({ error:e.code,message:e.message,details:e.details }) }] } }; }
}
