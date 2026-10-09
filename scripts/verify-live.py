"""Live acceptance checks against the authorized preview; never emit keys, cookies, or tokens."""
import copy,json,pathlib,re,subprocess,uuid
base='https://neurolex-preview.sanocks.workers.dev'
checks=[]
def request(path,method='GET',payload=None,bearer=None,cookie=None,expected=200):
    options=['url = '+json.dumps(base+path),'request = '+json.dumps(method),'header = "Content-Type: application/json"']
    if bearer:options.append('header = '+json.dumps('Authorization: Bearer '+bearer))
    if cookie:options.append('header = '+json.dumps('Cookie: '+cookie))
    if payload is not None:options.append('data = '+json.dumps(json.dumps(payload)))
    p=subprocess.run(['curl','-sS','-i','--config','-'],input='\n'.join(options)+'\n',text=True,capture_output=True)
    if p.returncode:raise RuntimeError('HTTP transport failed')
    head,content=p.stdout.split('\n\n',1)
    status=int(head.splitlines()[0].split()[1])
    if status!=expected:raise RuntimeError('Unexpected status for '+path+': '+str(status)+'; content withheld')
    try:return json.loads(content),head
    except ValueError:return content,head
key=(pathlib.Path(__file__).resolve().parent.parent/'.author-key').read_text().strip()
_,head=request('/auth/session','POST',{'key':key})
cookie=re.search(r'(?i)set-cookie: (__Host-neurolex-session=[^;]+)',head).group(1)
credential,_=request('/api/credentials','POST',{'name':'live-acceptance','scopes':['read','write','publish','schema']},cookie=cookie,expected=201)
token=credential['token']
def rpc(name,args={}):
    response,_=request('/mcp','POST',{'jsonrpc':'2.0','id':str(uuid.uuid4()),'method':'tools/call','params':{'name':name,'arguments':args}},bearer=token)
    result=response['result']
    if result.get('isError'):return json.loads(result['content'][0]['text'])
    return result['structuredContent']
try:
    discovered=rpc('schema_get');schema=discovered['schema'];old_version=schema['version']
    sample,_=request('/api/articles/neurofeedback?private=1',bearer=token)
    draft_id='agent-verification-20261009'
    existing,_=request('/api/articles?private=1',bearer=token)
    old=next((r for r in existing['articles'] if r['id']==draft_id),None)
    document=copy.deepcopy(sample['current']);document['id']=draft_id;document['values']['term']='Integration verification fixture';document['values']['equivalent']='Технический проверочный черновик';document['values']['sampleRecord']=True
    written=rpc('document_write',{'document':document,'schemaVersion':old_version,'expectedRevision':old['revision'] if old else 0,'idempotencyKey':'live-'+uuid.uuid4().hex})
    assert 'revision'in written
    stale=rpc('document_write',{'document':document,'schemaVersion':old_version,'expectedRevision':written['revision']-1})
    assert stale['error']=='REVISION_CONFLICT';checks.append('MCP schema discovery / draft write / stale revision rejection')
    public,_=request('/api/articles');assert not any(a['id']==draft_id for a in public['articles'])
    export,_=request('/api/export');assert not any(a['id']==draft_id for a in export['documents'])
    request('/api/articles/'+draft_id+'/history',expected=401);checks.append('Draft privacy across public search, export and history')
    if not any(f['id']=='discourseFunctions' for f in schema['fields']):
        next_schema=copy.deepcopy(schema);next_schema['version']+=1;next_schema['fields'].append({'id':'discourseFunctions','label':'Дискурсивные функции','description':'Researcher classification of discourse functions; optional repeated values.','section':'Термин в дискурсе','type':'text','multiple':True,'predicate':base+'/vocabulary#discourseFunctions','target':'article'})
        proposal={'schema':next_schema,'expectedSchemaVersion':old_version,'transformations':[]}
        preview=rpc('schema_preview',proposal);assert not preview['failures']
        applied=rpc('schema_apply',{**proposal,'expectedCorpusVersion':preview['corpusVersion'],'idempotencyKey':'migration-'+uuid.uuid4().hex});assert applied['schemaVersion']==next_schema['version']
        drift=rpc('document_write',{'document':document,'schemaVersion':old_version,'expectedRevision':written['revision']});assert drift['error']=='SCHEMA_CONFLICT'
        schema=next_schema;checks.append('Atomic optional schema extension and live schema-drift rejection')
    current=rpc('article_read',{'id':draft_id,'privateView':True});current['current']['values']['discourseFunctions']=['explanatory paraphrase']
    changed=rpc('document_write',{'document':current['current'],'schemaVersion':schema['version'],'expectedRevision':current['revision']})
    conflict=rpc('document_write',{'document':current['current'],'schemaVersion':schema['version'],'expectedRevision':current['revision']});assert conflict['error']=='REVISION_CONFLICT';assert changed['current']['values']['discourseFunctions']==['explanatory paraphrase'];checks.append('Generic new-field write and concurrent revision conflict')
    source,_=request('/api/articles/neurofeedback?private=1',bearer=token);original=copy.deepcopy(source['current']);modified=copy.deepcopy(original);modified['values']['equivalent']+=' [temporary verification draft]'
    saved=rpc('document_write',{'document':modified,'schemaVersion':schema['version'],'expectedRevision':source['revision']});public_before,_=request('/api/articles/neurofeedback');assert public_before['document']['values']['equivalent']==original['values']['equivalent']
    published=rpc('document_write',{'document':original,'schemaVersion':schema['version'],'expectedRevision':saved['revision'],'publish':True});public_after,_=request('/api/articles/neurofeedback');assert public_after['revision']==published['revision'];assert public_after['document']==original;checks.append('Server draft isolation and publication with original sample content restored')
    history=rpc('article_history',{'id':'neurofeedback'})['result'];assert len(history)>=4;checks.append('Persistent revision history')
    html,_=request('/article/neurofeedback');assert 'Метод обучения саморегуляции'in html and 'DefinedTerm'in html;checks.append('Readable deployed HTML without JavaScript')
    request('/api/articles/neurofeedback/export');request('/api/articles/neurofeedback/export?format=ttl');checks.append('Live JSON-LD and Turtle endpoints')
finally:
    request('/api/credentials/'+credential['id'],'DELETE',cookie=cookie)
request('/api/articles?private=1',bearer=token,expected=401);checks.append('Live credential revocation')
print(json.dumps({'passed':checks,'schemaVersion':schema['version'],'privateFixture':draft_id},ensure_ascii=False,indent=2))
