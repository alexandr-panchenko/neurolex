import { DomainError, type Change, type DictionarySchema, type RecordEntry, type Revision, type Snapshot } from '../domain/model';
import { initialSchema } from '../domain/schema';
export interface Receipt { actor: string; key: string; requestHash: string; body: unknown }
export class Store {
  constructor(public db: D1Database) {}
  async snapshot(): Promise<Snapshot> {
    const result = await this.db.batch([
      this.db.prepare('SELECT revision FROM control WHERE id=1'),
      this.db.prepare('SELECT body FROM schemas ORDER BY version DESC LIMIT 1'),
      this.db.prepare('SELECT body FROM articles'),
    ]);
    const control = result[0]!.results[0] as { revision: number };
    const schemaRow = result[1]!.results[0] as { body: string } | undefined;
    const records = (result[2]!.results as { body: string }[]).map((r) => JSON.parse(r.body) as RecordEntry);
    return { version: control.revision, schema: schemaRow ? JSON.parse(schemaRow.body) as DictionarySchema : structuredClone(initialSchema), records: Object.fromEntries(records.map((r) => [r.id,r])) };
  }
  async history(id: string): Promise<Revision[]> {
    const rows = await this.db.prepare('SELECT body FROM revisions WHERE article_id=? ORDER BY revision DESC LIMIT 200').bind(id).all<{ body: string }>();
    return rows.results.map((r) => JSON.parse(r.body) as Revision);
  }
  async revision(id: string, revision: number): Promise<Revision | null> { const row = await this.db.prepare('SELECT body FROM revisions WHERE article_id=? AND revision=?').bind(id,revision).first<{ body: string }>(); return row ? JSON.parse(row.body) as Revision : null; }
  async receipt(actor: string, key: string): Promise<{ request_hash: string; body: string } | null> { return this.db.prepare('SELECT request_hash,body FROM receipts WHERE actor=? AND key=?').bind(actor,key).first(); }
  async commit(snapshot: Snapshot, change: Change, actor: string, receipt?: Receipt): Promise<void> {
    const statements = [this.db.prepare('INSERT OR REPLACE INTO write_guard(id,expected) VALUES(1,?)').bind(snapshot.version), this.db.prepare('UPDATE control SET revision=revision+1 WHERE id=1')];
    if (change.schema) statements.push(this.db.prepare('INSERT INTO schemas(version,body,actor,created_at) VALUES(?,?,?,?)').bind(change.schema.version,JSON.stringify(change.schema),actor,new Date().toISOString()));
    else if (snapshot.version === 0) statements.push(this.db.prepare('INSERT OR IGNORE INTO schemas(version,body,actor,created_at) VALUES(?,?,?,?)').bind(snapshot.schema.version,JSON.stringify(snapshot.schema),actor,new Date().toISOString()));
    for (const record of change.records) statements.push(this.db.prepare('INSERT INTO articles(id,body) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').bind(record.id,JSON.stringify(record)));
    for (const rev of change.revisions) statements.push(this.db.prepare('INSERT INTO revisions(article_id,revision,body) VALUES(?,?,?)').bind(rev.document.id,rev.revision,JSON.stringify(rev)));
    if (receipt) statements.push(this.db.prepare('INSERT INTO receipts(actor,key,request_hash,body) VALUES(?,?,?,?)').bind(receipt.actor,receipt.key,receipt.requestHash,JSON.stringify(receipt.body)));
    if (statements.length > 500) throw new DomainError('MIGRATION_TOO_LARGE',422,'Пакет превышает лимит 500 SQL-операций. Разделение атомарной миграции не допускается.');
    try { await this.db.batch(statements); }
    catch (e) { if (String(e).includes('CORPUS_CONFLICT')) throw new DomainError('CORPUS_CONFLICT',409,'Словарь изменился во время операции. Повторно прочитайте текущую версию.'); throw e; }
  }
}
export async function digest(value: string): Promise<string> { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map((v) => v.toString(16).padStart(2,'0')).join(''); }
