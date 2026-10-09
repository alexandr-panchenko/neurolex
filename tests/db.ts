import { Database } from 'bun:sqlite';
import { readFileSync } from 'node:fs';
export function database(){
 const sql=new Database(':memory:');sql.exec(readFileSync('migrations/0001.sql','utf8'));sql.exec(readFileSync('migrations/0002_samples.sql','utf8'));
 const wrap=(query:string,args:unknown[]=[])=>({
  bind:(...values:unknown[])=>wrap(query,values),
  first:async()=>sql.query(query).get(...args as (string|number|null)[]),
  all:async()=>({success:true,results:sql.query(query).all(...args as (string|number|null)[]),meta:{}}),
  run:async()=>({success:true,results:[],meta:sql.query(query).run(...args as (string|number|null)[])}),
  query,args,
 });
 const db={prepare:(q:string)=>wrap(q),batch:async(statements:ReturnType<typeof wrap>[])=>sql.transaction(()=>statements.map((s)=>{const statement=sql.query(s.query);if(/^SELECT/i.test(s.query))return {success:true,results:statement.all(...s.args as (string|number|null)[]),meta:{}};return {success:true,results:[],meta:statement.run(...s.args as (string|number|null)[])};}))()};
 return db as unknown as D1Database;
}
