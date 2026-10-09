"""Verify a sourced external draft and privacy without printing credentials."""
import importlib.util,pathlib,uuid
spec=importlib.util.spec_from_file_location('owner',pathlib.Path(__file__).with_name('upgrade-topics.py'))
owner=importlib.util.module_from_spec(spec);spec.loader.exec_module(owner)
_,result=owner.request('/api/import/mesh',{'id':'D015225','equivalent':'магнитоэнцефалография'})
doc=result['document'];_,schema=owner.request('/api/schema')
_,preview=owner.request('/api/import/preview',{'documents':[doc],'schemaVersion':schema['schema']['version']})
assert not any('error' in row for row in preview['outcomes']),preview
_,applied=owner.request('/api/import/apply',{'documents':[doc],'schemaVersion':schema['schema']['version']})
_,private=owner.request('/api/articles/'+doc['id']+'?private=1')
assert private['published'] is None
assert private['current']['values']['externalRecord']['id']=='D015225'
_,public=owner.request('/api/articles');assert doc['id'] not in [row['id'] for row in public['articles']]
_,config=owner.request('/api/assistant/config')
_,feedback=owner.request('/api/feedback',{'page':'/article/'+doc['id'],'message':'Pilot verification: external MeSH draft imported with its source and remains private.'})
assert feedback['saved']
print('Live MeSH import: sourced private draft '+doc['id']+'; public article count '+str(len(public['articles'])))
print('Configured assistant providers: '+str(config['providers'])+'; Parallel enabled: '+str(config['search']))
