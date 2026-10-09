import { expect,test } from 'bun:test';
import app from '../src/worker';
import { database } from './db';
import { digest } from '../src/server/store';
import { issueCredential } from '../src/server/auth';
import type { Env } from '../src/server/auth';
async function environment():Promise<Env>{return {DB:database(),ASSETS:{fetch:async()=>new Response('<html><head><title>Preview</title></head><body><div id="root"></div></body></html>')} as unknown as Fetcher,AUTHOR_EMAIL:'owner@example.test',SITE_NAME:'NeuroLex',AUTHOR_KEY_HASH:await digest('fixture-owner-key')};}
test('anonymous reads published records but cannot read history, private exports or write via HTTP/MCP',async()=>{
 const env=await environment();expect((await app.request('/api/articles',{},env)).status).toBe(200);
 for(const path of ['/api/articles?private=1','/api/articles/neurofeedback/history','/api/export?private=1'])expect((await app.request(path,{},env)).status).toBe(401);
 expect((await app.request('/api/write',{method:'POST',body:'{}'},env)).status).toBe(401);
 const response=await app.request('/mcp',{method:'POST',body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'document_write',arguments:{}}})},env);
 const result=await response.json() as {result:{isError:boolean}};expect(result.result.isError).toBe(true);
});
test('author login issues a cookie; forged headers and cross-origin login do not authorize',async()=>{
 const env=await environment();const login=await app.request('/auth/session',{method:'POST',headers:{Origin:'http://localhost'},body:JSON.stringify({key:'fixture-owner-key'})},env);
 expect(login.status).toBe(200);expect(login.headers.get('set-cookie')).toContain('HttpOnly');expect(login.headers.get('set-cookie')).toContain('Secure');
 expect((await app.request('/auth/session',{method:'POST',headers:{Origin:'https://evil.example'},body:JSON.stringify({key:'fixture-owner-key'})},env)).status).toBe(403);
 expect((await app.request('/api/articles?private=1',{headers:{'Cf-Access-Authenticated-User-Email':env.AUTHOR_EMAIL}},env)).status).toBe(401);
 expect((await app.request('/auth/access',{headers:{'Cf-Access-Jwt-Assertion':'forged'}},{...env,ACCESS_AUD:'test',ACCESS_TEAM_DOMAIN:'test.cloudflareaccess.com'})).status).toBe(403);
});
test('delegated credentials expire and revoke; write-only agent cannot publish',async()=>{
 const env=await environment();const expired=await issueCredential(env,'agent:expired',['read'],-1);expect((await app.request('/api/articles?private=1',{headers:{Authorization:'Bearer '+expired.token}},env)).status).toBe(401);const credential=await issueCredential(env,'agent:test',['read','write'],3600);const headers={Authorization:'Bearer '+credential.token};
 expect((await app.request('/api/articles?private=1',{headers},env)).status).toBe(200);
 const read=await app.request('/api/articles/neurofeedback?private=1',{headers},env);const record=await read.json() as {current:unknown;revision:number};
 expect((await app.request('/api/write',{method:'POST',headers,body:JSON.stringify({document:record.current,expectedRevision:record.revision,schemaVersion:1,publish:true})},env)).status).toBe(403);
 await env.DB.prepare('UPDATE credentials SET revoked=1 WHERE id=?').bind(credential.id).run();
 expect((await app.request('/api/articles?private=1',{headers},env)).status).toBe(401);
});
test('public HTML has readable article text without executing JavaScript',async()=>{
 const env=await environment();const response=await app.request('/article/neurofeedback',{},env);const html=await response.text();expect(response.status).toBe(200);expect(html).toContain('Метод обучения саморегуляции');expect(html).toContain('DefinedTerm');expect(html).not.toContain('owner@example.test');
});
test('invited author uses a personal browser key without owner privileges; logout retains invitation and owner revocation ends access',async()=>{
 const env=await environment();const owner=await issueCredential(env,'owner',['read','write','credentials'],3600);
 const created=await app.request('/api/credentials',{method:'POST',headers:{Authorization:'Bearer '+owner.token},body:JSON.stringify({kind:'author',name:'writer@example.test',scopes:['read','write']})},env);
 expect(created.status).toBe(201);const key=await created.json() as {id:string;token:string};
 const login=await app.request('/auth/session',{method:'POST',body:JSON.stringify({key:key.token})},env);expect(login.status).toBe(200);
 const cookie=login.headers.get('set-cookie')!.split(';')[0]!;const headers={Cookie:cookie};
 const session=await (await app.request('/api/session',{headers},env)).json() as {actor:{id:string;scopes:string[];origin:string}};
 expect(session.actor.id).toBe('author:invited:writer@example.test');expect(session.actor.origin).toBe('browser');expect(session.actor.scopes).toEqual(['read','write']);
 expect((await app.request('/api/credentials',{headers},env)).status).toBe(403);
 expect((await app.request('/api/schema/apply',{method:'POST',headers,body:'{}'},env)).status).toBe(403);
 const read=await app.request('/api/articles/neurofeedback?private=1',{headers},env);const record=await read.json() as {current:unknown;revision:number};
 expect((await app.request('/api/write',{method:'POST',headers,body:JSON.stringify({document:record.current,expectedRevision:record.revision,schemaVersion:1,publish:true})},env)).status).toBe(403);
 expect((await app.request('/api/write',{method:'POST',headers,body:JSON.stringify({document:record.current,expectedRevision:record.revision,schemaVersion:1,publish:false})},env)).status).toBe(200);
 expect((await app.request('/auth/logout',{method:'POST',headers},env)).status).toBe(200);
 expect((await app.request('/auth/session',{method:'POST',body:JSON.stringify({key:key.token})},env)).status).toBe(200);
 await app.request('/api/credentials/'+key.id,{method:'DELETE',headers:{Authorization:'Bearer '+owner.token}},env);
 expect((await app.request('/api/articles?private=1',{headers},env)).status).toBe(401);
 expect((await app.request('/auth/session',{method:'POST',body:JSON.stringify({key:key.token})},env)).status).toBe(401);
 expect((await app.request('/api/credentials',{method:'POST',headers:{Authorization:'Bearer '+owner.token},body:JSON.stringify({kind:'author',name:'writer',scopes:['write']})},env)).status).toBe(422);
});

test('fully authorized invited author can manage schema and issue keys; logout preserves the personal key',async()=>{
 const env=await environment();const scopes=['read','write','publish','schema','credentials'];const owner=await issueCredential(env,'owner',scopes,3600);
 const response=await app.request('/api/credentials',{method:'POST',headers:{Authorization:'Bearer '+owner.token},body:JSON.stringify({kind:'author',name:'full-author',scopes})},env);
 expect(response.status).toBe(201);const key=await response.json() as {token:string};
 const login=await app.request('/auth/session',{method:'POST',body:JSON.stringify({key:key.token})},env);expect(login.status).toBe(200);const headers={Cookie:login.headers.get('set-cookie')!.split(';')[0]!};
 const session=await (await app.request('/api/session',{headers},env)).json() as {actor:{scopes:string[]}};expect(session.actor.scopes).toEqual(scopes);
 expect((await app.request('/api/credentials',{headers},env)).status).toBe(200);
 expect((await app.request('/api/schema/preview',{method:'POST',headers,body:'{}'},env)).status).not.toBe(403);
 expect((await app.request('/api/credentials',{method:'POST',headers,body:JSON.stringify({kind:'author',name:'next-author',scopes})},env)).status).toBe(201);
 await app.request('/auth/logout',{method:'POST',headers},env);
 expect((await app.request('/auth/session',{method:'POST',body:JSON.stringify({key:key.token})},env)).status).toBe(200);
});
