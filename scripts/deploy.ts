import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dir,'..');
let config:Record<string,unknown>;
try{config=JSON.parse(readFileSync(resolve(root,'.wrangler.local.jsonc'),'utf8'));}catch{config=JSON.parse(readFileSync(resolve(root,'wrangler.jsonc'),'utf8'));}
const databases=config.d1_databases as {database_id:string;migrations_dir:string}[];
if(process.env.CLOUDFLARE_ACCOUNT_ID)config.account_id=process.env.CLOUDFLARE_ACCOUNT_ID;
if(process.env.CLOUDFLARE_DATABASE_ID)databases[0]!.database_id=process.env.CLOUDFLARE_DATABASE_ID;
if(process.env.AUTHOR_EMAIL)(config.vars as Record<string,string>).AUTHOR_EMAIL=process.env.AUTHOR_EMAIL;
if(!config.account_id||databases[0]!.database_id==='00000000-0000-0000-0000-000000000000')throw new Error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_DATABASE_ID or use ignored .wrangler.local.jsonc.');
config.main=resolve(root,String(config.main));(config.assets as Record<string,unknown>).directory=resolve(root,'dist/client');databases[0]!.migrations_dir=resolve(root,'migrations');
mkdirSync(resolve(root,'.wrangler'),{recursive:true});const path=resolve(root,'.wrangler/deploy.json');writeFileSync(path,JSON.stringify(config),{mode:0o600});
const command=process.argv.slice(2);const args=command.length?command:['deploy'];
const child=Bun.spawn(['bunx','wrangler',...args,'--config',path],{cwd:root,stdin:'inherit',stdout:'inherit',stderr:'inherit',env:{...process.env,WRANGLER_SEND_METRICS:'false'}});process.exit(await child.exited);
