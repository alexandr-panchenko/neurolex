import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { DomainError, type Actor } from '../domain/model';
import { digest } from './store';
export interface Env { DB: D1Database; ASSETS: Fetcher; AUTHOR_EMAIL: string; SITE_NAME: string; AUTHOR_KEY_HASH?: string; ACCESS_TEAM_DOMAIN?: string; ACCESS_AUD?: string; OPENAI_API_KEY?:string; OPENAI_MODEL?:string; GEMINI_API_KEY?:string; GEMINI_MODEL?:string; PARALLEL_API_KEY?:string; CHAT_PROVIDER?:string }
export const authorScopes = ['read','write','publish','schema','credentials'];
export function sameOrigin(c: Context<{ Bindings: Env }>) {
  const origin = c.req.header('Origin'); if (origin && origin !== new URL(c.req.url).origin) throw new DomainError('ORIGIN_FORBIDDEN',403,'Запрос с другого сайта запрещён.');
}
export async function authenticate(c: Context<{ Bindings: Env }>): Promise<Actor | null> {
  const bearer = c.req.header('Authorization')?.match(/^Bearer (\S+)$/)?.[1];
  const token = bearer || getCookie(c,'__Host-neurolex-session');
  if (!token) return null;
  if (!bearer && !['GET','HEAD'].includes(c.req.method)) sameOrigin(c);
  const row = await c.env.DB.prepare('SELECT actor,scopes,expires_at,revoked FROM credentials WHERE hash=?').bind(await digest(token)).first<{ actor: string; scopes: string; expires_at: string; revoked: number }>();
  if (!row || row.revoked || Date.parse(row.expires_at) <= Date.now()) return null;
  return { id:row.actor, origin:bearer ? 'agent' : 'browser',scopes:JSON.parse(row.scopes) as string[] };
}
export async function issueCredential(env: Env, actor: string, scopes: string[], lifetimeSeconds: number) {
  const raw = Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2,'0')).join('');
  const id = crypto.randomUUID(); const expires = new Date(Date.now()+lifetimeSeconds*1000).toISOString();
  await env.DB.prepare('INSERT INTO credentials(id,hash,actor,scopes,expires_at) VALUES(?,?,?,?,?)').bind(id,await digest(raw),actor,JSON.stringify(scopes),expires).run();
  return { id, token:raw, expiresAt:expires, scopes };
}
export async function authorSession(c: Context<{ Bindings: Env }>) {
  const credential = await issueCredential(c.env,'author:'+c.env.AUTHOR_EMAIL,authorScopes,8*3600);
  setCookie(c,'__Host-neurolex-session',credential.token,{ httpOnly:true,secure:true,sameSite:'Strict',path:'/',maxAge:8*3600 });
  return { actor:'author:'+c.env.AUTHOR_EMAIL,scopes:authorScopes };
}
export async function accessLogin(c: Context<{ Bindings: Env }>) {
  if (!c.env.ACCESS_TEAM_DOMAIN || !c.env.ACCESS_AUD) throw new DomainError('ACCESS_NOT_CONFIGURED',503,'Cloudflare Access ещё не настроен.');
  const assertion = c.req.header('Cf-Access-Jwt-Assertion'); if (!assertion) throw new DomainError('UNAUTHENTICATED',401,'Нужен вход через Cloudflare Access.');
  const issuer = 'https://'+c.env.ACCESS_TEAM_DOMAIN;
  try { const { payload } = await jwtVerify(assertion,createRemoteJWKSet(new URL(issuer+'/cdn-cgi/access/certs')),{ issuer,audience:c.env.ACCESS_AUD }); if (payload.email !== c.env.AUTHOR_EMAIL) throw new Error(); }
  catch { throw new DomainError('FORBIDDEN',403,'Access JWT или адрес автора не подтверждён.'); }
  await authorSession(c); return c.redirect('/');
}
