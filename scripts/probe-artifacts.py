"""Bounded live Git probe; credentials stay in subprocess environments, never files/output."""
import json, os, pathlib, subprocess, tempfile

env = dict(os.environ)
env['PATH'] = '/usr/bin:' + env['PATH']
env['WRANGLER_SEND_METRICS'] = 'false'
repo_name = 'storage-probe-20261009'
namespace = 'neurolex-experiment'

def wrangler(*args):
    p = subprocess.run(['bunx', 'wrangler', 'artifacts', *args, '--json'], env=env, capture_output=True, text=True)
    if p.returncode: raise RuntimeError('Artifacts CLI failed; output withheld to protect credentials')
    return json.loads(p.stdout)

metadata = wrangler('repos', 'get', repo_name, '--namespace', namespace)
token = wrangler('repos', 'issue-token', repo_name, '--namespace', namespace, '--scope', 'write', '--ttl', '900')
git_env = dict(env, GIT_CONFIG_COUNT='3', GIT_CONFIG_KEY_0='http.extraHeader', GIT_CONFIG_VALUE_0='Authorization: Bearer ' + token['plaintext'], GIT_CONFIG_KEY_1='user.name', GIT_CONFIG_VALUE_1='NeuroLex storage probe', GIT_CONFIG_KEY_2='user.email', GIT_CONFIG_VALUE_2='probe@example.invalid', GIT_TERMINAL_PROMPT='0')

def git(path, *args, expected=0):
    p = subprocess.run(['git', '-C', str(path), *args], env=git_env, capture_output=True, text=True)
    if expected == 0 and p.returncode: raise RuntimeError('Git operation failed: ' + args[0] + '; output withheld')
    if expected != 0 and p.returncode == 0: raise RuntimeError('Expected stale write rejection')
    return p.stdout.strip()

with tempfile.TemporaryDirectory(prefix='neurolex-artifacts-') as temp:
    root = pathlib.Path(temp); first = root/'first'; second = root/'second'; verify = root/'verify'
    git(root, 'clone', metadata['remote'], str(first))
    git(first, 'checkout', '-B', 'main')
    (first/'schema.json').write_text(json.dumps({'version': 1}))
    (first/'article.json').write_text(json.dumps({'schemaVersion': 1, 'status': 'draft', 'value': 'first'}))
    git(first, 'add', '.'); git(first, 'commit', '-m', 'Seed schema and draft')
    git(first, 'push', 'origin', 'main')
    git(root, 'clone', metadata['remote'], str(second))
    (first/'schema.json').write_text(json.dumps({'version': 2}))
    (first/'article.json').write_text(json.dumps({'schemaVersion': 2, 'status': 'published', 'value': 'second'}))
    (first/'published-index.json').write_text(json.dumps({'schemaVersion': 2, 'articles': ['article.json']}))
    git(first, 'add', '.'); git(first, 'commit', '-m', 'Update schema document and publication index together')
    revision = git(first, 'rev-parse', 'HEAD'); git(first, 'push', 'origin', 'main')
    (second/'article.json').write_text(json.dumps({'schemaVersion': 1, 'value': 'stale'}))
    git(second, 'add', '.'); git(second, 'commit', '-m', 'Attempt stale write')
    git(second, 'push', 'origin', 'main', expected=1)
    git(root, 'clone', metadata['remote'], str(verify))
    assert json.loads((verify/'schema.json').read_text())['version'] == 2
    assert json.loads((verify/'article.json').read_text())['schemaVersion'] == 2
    assert json.loads((verify/'published-index.json').read_text())['schemaVersion'] == 2
    assert git(verify, 'rev-parse', 'HEAD') == revision
    assert git(verify, 'rev-list', '--count', 'HEAD') == '2'
    print(json.dumps({'readWrite': 'passed', 'stalePush': 'rejected', 'groupedSchemaDocumentIndex': 'passed', 'historyCommits': 2, 'head': revision}))
