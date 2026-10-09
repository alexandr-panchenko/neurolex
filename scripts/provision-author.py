"""Provision a high-entropy owner login key; never print it or pass it on a command line."""
import hashlib, os, pathlib, secrets, subprocess
root=pathlib.Path(__file__).resolve().parent.parent
path=root/'.author-key'
if path.exists():
    key=path.read_text().strip()
else:
    key=secrets.token_urlsafe(32)
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    with os.fdopen(fd,'w') as handle: handle.write(key+'\n')
key_hash=hashlib.sha256(key.encode()).hexdigest()
(root/'.dev.vars').write_text('AUTHOR_KEY_HASH='+key_hash+'\n')
os.chmod(root/'.dev.vars',0o600)
env=dict(os.environ);env['PATH']='/usr/bin:'+env['PATH'];env['WRANGLER_SEND_METRICS']='false'
result=subprocess.run(['bunx','wrangler','secret','put','AUTHOR_KEY_HASH'],cwd=root,env=env,input=key_hash+'\n',text=True,capture_output=True)
if result.returncode: raise SystemExit('Secret provisioning failed; credentials withheld')
print('Owner key prepared in the ignored .author-key file (0600); only its SHA-256 hash was stored in the Worker secret.')
