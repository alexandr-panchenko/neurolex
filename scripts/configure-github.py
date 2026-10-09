"""Set private deployment credentials and enable main-branch automatic deployment."""
import json,pathlib,subprocess,sys
source=pathlib.Path(sys.argv[1]).expanduser();raw=source.read_text().strip()
if source.suffix=='.json': token=json.loads(raw)['CLOUDFLARE_API_TOKEN']
elif 'CLOUDFLARE_API_TOKEN=' in raw: token=next(line.split('=',1)[1].strip().strip('\"\'') for line in raw.splitlines() if line.startswith('CLOUDFLARE_API_TOKEN='))
else: token=raw
if not token or '\n' in token: raise SystemExit('Expected a Cloudflare API token, JSON or dotenv file.')
root=pathlib.Path(__file__).resolve().parent.parent;config=json.loads((root/'.wrangler.local.jsonc').read_text())
settings={'CLOUDFLARE_API_TOKEN':token,'CLOUDFLARE_ACCOUNT_ID':config['account_id'],'CLOUDFLARE_DATABASE_ID':config['d1_databases'][0]['database_id'],'AUTHOR_EMAIL':config['vars']['AUTHOR_EMAIL']}
for name,value in settings.items():
    process=subprocess.run(['gh','secret','set',name],input=value,text=True,capture_output=True,cwd=root)
    if process.returncode: raise SystemExit('GitHub secret provisioning failed for '+name+'. No credentials were printed.')
subprocess.run(['gh','variable','set','DEPLOY_ENABLED','--body','true'],check=True,cwd=root)
subprocess.run(['gh','workflow','run','check.yml'],check=True,cwd=root)
print('Private deployment secrets configured; verification/deployment workflow dispatched.')
