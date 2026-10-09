"""Provision server-side provider settings from a private JSON or dotenv file."""
import json,pathlib,subprocess,sys
source=pathlib.Path(sys.argv[1]).expanduser()
raw=source.read_text()
values=json.loads(raw) if source.suffix=='.json' else dict(line.split('=',1) for line in raw.splitlines() if '=' in line and not line.lstrip().startswith('#'))
allowed={'OPENAI_API_KEY','OPENAI_MODEL','GEMINI_API_KEY','GEMINI_MODEL','PARALLEL_API_KEY','CHAT_PROVIDER','ACCESS_TEAM_DOMAIN','ACCESS_AUD'}
settings={key:str(value).strip().strip('\"\'') for key,value in values.items() if key in allowed and str(value).strip()}
for provider in ['OPENAI','GEMINI']:
    if provider+'_API_KEY' in settings and provider+'_MODEL' not in settings: raise SystemExit('Specify '+provider+'_MODEL explicitly alongside its API key.')
if not settings: raise SystemExit('No supported provider settings found.')
root=pathlib.Path(__file__).resolve().parent.parent
process=subprocess.run(['bun','scripts/deploy.ts','secret','bulk'],input=json.dumps(settings),text=True,capture_output=True,cwd=root)
if process.returncode: raise SystemExit('Server secret provisioning failed; verify Wrangler access. No credentials were printed.')
print('Server settings configured: '+', '.join(sorted(settings)))
