"""Apply the compatible, previewed topic-field change through owner operations."""
import json,pathlib,re,subprocess,os
base=os.environ.get('NEUROLEX_BASE_URL','https://neurolex-preview.sanocks.workers.dev').rstrip('/')
cookie=None

def request(path,body=None):
    config='url = '+json.dumps(base+path)+'\nsilent\nshow-error\ninclude\n'
    if cookie: config+='header = '+json.dumps('Cookie: '+cookie)+'\n'
    if body is not None: config+='header = "Content-Type: application/json"\nheader = '+json.dumps('Origin: '+base)+'\ndata-binary = '+json.dumps(json.dumps(body))+'\n'
    output=subprocess.run(['curl','--config','-'],input=config,text=True,capture_output=True,check=True).stdout
    headers,payload=output.rsplit('\r\n\r\n' if '\r\n\r\n' in output else '\n\n',1)
    status=re.findall(r'HTTP/\S+ (\d+)',headers)[-1]
    if int(status)>=400: raise RuntimeError('Operation failed with HTTP '+status)
    return headers,json.loads(payload)
key=pathlib.Path(__file__).resolve().parent.parent.joinpath('.author-key').read_text().strip()
headers,_=request('/auth/session',{'key':key});key=''
cookie=re.search(r'set-cookie:\s*([^;\r\n]+)',headers,re.I).group(1)
_,current=request('/api/schema');schema=current['schema'];field=next(f for f in schema['fields'] if f['id']=='category')
if field['type']=='text':
    print('Topic field already supports author-created sections; no migration needed.')
else:
    previous=schema['version'];schema['version']+=1;field['type']='text';field['label']='Раздел словаря';field['description']='Выберите существующий раздел или введите название нового. Раздел принадлежит статье; навигация строится по видимым статьям.';field.pop('options',None)
    proposal={'schema':schema,'expectedSchemaVersion':previous,'transformations':[]}
    _,preview=request('/api/schema/preview',proposal)
    if preview['failures']:raise RuntimeError('Preview validation failed; nothing applied')
    _,result=request('/api/schema/apply',{**proposal,'expectedCorpusVersion':preview['corpusVersion']})
    print('Compatible topic-field migration applied atomically; schema version '+str(result['schemaVersion'])+'. Existing article categories and revisions retained.')
