"""Verify the pinned official NeuroLex/InterLex source through real owner operations."""
import importlib.util,pathlib
spec=importlib.util.spec_from_file_location('owner',pathlib.Path(__file__).with_name('upgrade-topics.py'))
owner=importlib.util.module_from_spec(spec);spec.loader.exec_module(owner)
_,result=owner.request('/api/import/interlex',{'id':'ilx_0107518','equivalent':'исследование трассировки нервных путей'})
doc=result['document'];record=result['record']
assert record['id']=='nlx_inv_090919' and record['interlex']==['http://uri.interlex.org/base/ilx_0107518']
_,preview=owner.request('/api/import/preview',{'documents':[doc],'schemaVersion':doc['schemaVersion']})
assert not any('error' in row for row in preview['outcomes']),preview
owner.request('/api/import/apply',{'documents':[doc],'schemaVersion':doc['schemaVersion']})
_,private=owner.request('/api/articles/'+doc['id']+'?private=1')
assert private['published'] is None
assert private['current']['values']['definition']['attrs']['language']=='en'
assert private['current']['values']['externalRecord']['source']==record['source']
_,public=owner.request('/api/articles');assert doc['id'] not in [row['id'] for row in public['articles']]
# Correct only the imported MeSH draft's language metadata, retaining its text and publication state.
_,mesh=owner.request('/api/articles/magnetoencephalography?private=1')
current=mesh['current'];definition=current['values']['definition']
if definition.get('attrs',{}).get('language')!='en':
    definition['attrs']={**definition.get('attrs',{}),'language':'en'}
    owner.request('/api/write',{'document':current,'schemaVersion':current['schemaVersion'],'expectedRevision':mesh['revision'],'publish':False})
print('Live official NeuroLex / InterLex import verified: '+doc['id']+'; external IDs and English preserved; unpublished. Public articles: '+str(len(public['articles'])))
