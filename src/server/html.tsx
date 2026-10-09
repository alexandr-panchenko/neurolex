import { renderToString } from 'react-dom/server.browser';
import { App } from '../ui/App';
import type { Bootstrap } from '../ui/api';
import type { Env } from './auth';
import { text } from '../domain/export';
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export async function articleHtml(env:Env,request:Request,data:Bootstrap,id='') {
  const asset=await env.ASSETS.fetch(new Request(new URL('/',request.url)));let shell=await asset.text();
  const doc=data.articles.find((a)=>a.id===id)?.document;const title=doc?text(doc.values.term)+' — '+env.SITE_NAME:env.SITE_NAME+' · Словарь нейротехнологий';
  const description=doc?text(doc.values.definition).slice(0,180):'Исследовательский словарь нейротехнологических терминов.';
  const base=new URL(request.url).origin;const canonical=base+(id?'/article/'+id:'/');
  shell=shell.replace(/<title>.*?<\/title>/, '<title>'+escape(title)+'</title>').replace(/<meta name="description"[^>]*>/,'<meta name="description" content="'+escape(description)+'">');
  const metadata=doc?{ '@context':'https://schema.org','@type':'DefinedTerm',name:text(doc.values.term),description,inDefinedTermSet:base+'/',url:canonical }:{ '@context':'https://schema.org','@type':'DefinedTermSet',name:env.SITE_NAME,url:base+'/',description };
  shell=shell.replace('</head>',`<link rel="canonical" href="${escape(canonical)}"><script type="application/ld+json">${JSON.stringify(metadata).replaceAll('<','\\u003c')}</script></head>`);
  shell=shell.replace('<div id="root"></div>','<div id="root">'+renderToString(<App initial={data} initialId={id} initialCategory={new URL(request.url).searchParams.get('category')||''}/>)+'</div><script id="bootstrap" type="application/json">'+JSON.stringify(data).replaceAll('<','\\u003c')+'</script>');
  return new Response(shell,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}
