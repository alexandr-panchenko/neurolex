import type { DictionarySchema, Document, Json, RecordEntry, Revision } from '../domain/model';
export interface Listed { id: string; revision: number | null; document: Document; status: string }
export interface Bootstrap { schema: DictionarySchema; corpusVersion: number; articles: Listed[] }
export interface Session { actor: { id: string; scopes: string[] } | null; accessConfigured: boolean }
export class ApiError extends Error { constructor(public code: string, message: string, public details: unknown) { super(message); } }
export async function api<T>(path: string, data?: unknown, method = data === undefined ? 'GET' : 'POST', key?: string): Promise<T> {
  const response = await fetch(path,{ method,keepalive:path==='/api/write'&&data!==undefined&&new TextEncoder().encode(JSON.stringify(data)).byteLength<60000,credentials:'same-origin',headers:{ ...(data !== undefined ? {'Content-Type':'application/json'} : {}),...(key ? {'Idempotency-Key':key} : {}) },...(data !== undefined ? {body:JSON.stringify(data)} : {}) });
  const result = await response.json() as { error?: string; message?: string; details?: unknown };
  if (!response.ok) throw new ApiError(result.error || 'REQUEST_FAILED',result.message || 'Запрос не выполнен.',result.details); return result as T;
}
export type { DictionarySchema, Document, Json, RecordEntry, Revision };
