export type Json = null | string | number | boolean | Json[] | { [key: string]: Json };
export type Values = Record<string, Json>;
export interface Field {
  id: string; label: string; description: string; section: string;
  type: 'text' | 'richText' | 'number' | 'boolean' | 'date' | 'enum' | 'reference' | 'object';
  required?: boolean; multiple?: boolean; options?: string[]; fields?: Field[];
  predicate: string; target: 'article' | 'concept';
}
export interface DictionarySchema { version: number; fields: Field[]; categories: string[]; contextVersion: number }
export interface Document { id: string; schemaVersion: number; values: Values }
export interface Revision { revision: number; document: Document; actor: string; origin: string; time: string; action: string }
export interface RecordEntry { id: string; revision: number; current: Document; published: Document | null; publishedRevision: number | null; updatedAt: string }
export interface Snapshot { version: number; schema: DictionarySchema; records: Record<string, RecordEntry> }
export interface Actor { id: string; origin: 'browser' | 'agent' | 'import'; scopes: string[] }
export interface Change { records: RecordEntry[]; revisions: Revision[]; schema?: DictionarySchema; result: unknown }
export class DomainError extends Error {
  constructor(public code: string, public status: number, message: string, public details: unknown = null) { super(message); }
}
export function requireScope(actor: Actor | null, scope: string): asserts actor is Actor {
  if (!actor) throw new DomainError('UNAUTHENTICATED', 401, 'Войдите для изменения словаря.');
  if (!actor.scopes.includes(scope)) throw new DomainError('FORBIDDEN', 403, 'Недостаточно прав.', { requiredScope: scope });
}
export const own = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);
export function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
