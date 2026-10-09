import type { ReactNode } from 'react';
import type { DictionarySchema, Document, Field, Json } from '../domain/model';
import { richSchema } from '../domain/mock';
import { ArticleField, type Choice } from './ArticleField';
import { RichReading } from './RichText';
import { ranges, sequenceDiff, wordDiff, type Part } from './diff';
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
function highlight(content:string,offset:number,changes:ReturnType<typeof ranges>):ReactNode {
 return changes.filter(r=>r.end>offset&&r.start<offset+content.length).map((r,i)=>r.changed?<mark key={i}>{content.slice(Math.max(0,r.start-offset),r.end-offset)}</mark>:<span key={i}>{content.slice(Math.max(0,r.start-offset),r.end-offset)}</span>);
}
function TextChange({before,after}:{before:string|undefined;after:string|undefined}) {
 const changes=wordDiff(before||'',after||'');return <>{before!==undefined&&<div className="diff-line diff-remove"><span className="diff-sign" aria-label="Удалено">−</span><span>{highlight(before,0,ranges(changes,'remove'))}</span></div>}{after!==undefined&&<div className="diff-line diff-add"><span className="diff-sign" aria-label="Добавлено">+</span><span>{highlight(after,0,ranges(changes,'add'))}</span></div>}</>;
}
function RichChange({before,after}:{before:Json|undefined;after:Json|undefined}) {
 const blocks=(value:Json|undefined):Json[]=>value&&typeof value==='object'&&!Array.isArray(value)&&Array.isArray(value.content)?value.content:[];
 const changes=sequenceDiff(blocks(before),blocks(after),equal);const rows:ReactNode[]=[];
 const render=(value:Json,key:number,kind:Part<Json>['kind'],other?:Json)=>{
 const doc={type:'doc',content:[value]};const words=wordDiff(kind==='add'&&other?richSchema.nodeFromJSON(other).textContent:kind==='remove'?richSchema.nodeFromJSON(value).textContent:'',kind==='remove'&&other?richSchema.nodeFromJSON(other).textContent:kind==='add'?richSchema.nodeFromJSON(value).textContent:'');
 return kind==='equal'?<RichReading key={key} value={doc}/>:<div key={key} className={'diff-line diff-'+kind}><span className="diff-sign" aria-label={kind==='remove'?'Удалено':'Добавлено'}>{kind==='remove'?'−':'+'}</span><div><RichReading value={doc} highlight={(s,offset)=>highlight(s,offset,ranges(words,kind))}/></div></div>;
 };
 for(let i=0;i<changes.length;){const part=changes[i]!;if(part.kind==='equal'){rows.push(render(part.value,i,'equal'));i++;continue;}const removed:Json[]=[],added:Json[]=[];const key=i;while(i<changes.length&&changes[i]!.kind!=='equal'){const p=changes[i++]!;(p.kind==='remove'?removed:added).push(p.value);}for(let j=0;j<Math.max(removed.length,added.length);j++){if(removed[j])rows.push(render(removed[j]!,key*1000+j*2,'remove',added[j]));if(added[j])rows.push(render(added[j]!,key*1000+j*2+1,'add',removed[j]));}}
 return <>{rows}</>;
}
function ValueDiff({field:f,before,after,terms}:{field:Field;before:Json|undefined;after:Json|undefined;terms:Choice[]}) {
 if(equal(before,after))return <ArticleField field={f} value={after} editing={false} change={()=>{}} terms={terms} sources={[]} path=""/>;
 if(f.multiple){const old=Array.isArray(before)?before:[],next=Array.isArray(after)?after:[];const ids=(v:Json)=>v&&typeof v==='object'&&!Array.isArray(v)&&typeof v.id==='string'?v.id:null;const keys=[...new Set([...old.map((v,i)=>ids(v)||String(i)),...next.map((v,i)=>ids(v)||String(i))])];return <>{keys.map(key=>{const find=(items:Json[])=>items.find((v,i)=>(ids(v)||String(i))===key);return <div className="repeated-item" key={key}><ValueDiff field={{...f,multiple:false}} before={find(old)} after={find(next)} terms={terms}/></div>;})}</>;}
 if(f.type==='richText')return <RichChange before={before} after={after}/>;
 if(f.type==='object'){const old=before&&typeof before==='object'&&!Array.isArray(before)?before:{},next=after&&typeof after==='object'&&!Array.isArray(after)?after:{};return <div className={f.id==='examples'?'example':''}>{(f.fields||[]).filter(child=>old[child.id]!==undefined||next[child.id]!==undefined).map(child=><div className="nested-field" key={child.id}><span className="field-caption">{child.label}</span><ValueDiff field={child} before={old[child.id]} after={next[child.id]} terms={terms}/></div>)}</div>;}
 const readable=(v:Json|undefined)=>v===undefined?undefined:typeof v==='boolean'?v?'Да':'Нет':f.type==='reference'?terms.find(t=>t.id===v)?.label||String(v):({synthetic:'Синтетический пример',attested:'Засвидетельствованный фрагмент',ru:'Русский',en:'Английский'} as Record<string,string>)[String(v)]||String(v);
 return <TextChange before={readable(before)} after={readable(after)}/>;
}
function historicalField(id:string,value:Json|undefined):Field {
 const multiple=Array.isArray(value);const example=multiple?value[0]:value;const group=example&&typeof example==='object'&&!Array.isArray(example)?example:null;
 return {id,label:id,section:'Другие сведения',description:'Поле прежней структуры',predicate:'https://example.invalid/'+id,target:'article',multiple,type:group?(group.type==='doc'?'richText':'object'):typeof example==='boolean'?'boolean':typeof example==='number'?'number':'text',...(group&&group.type!=='doc'?{fields:Object.entries(group).map(([key,v])=>historicalField(key,v))}:{})};
}
export function ArticleDiff({before,after,schema,terms}:{before:Document|undefined;after:Document;schema:DictionarySchema;terms:Choice[]}) {
 const fields=[...schema.fields];for(const id of new Set([...Object.keys(before?.values||{}),...Object.keys(after.values)]))if(id!=='sampleRecord'&&!fields.some(f=>f.id===id))fields.push(historicalField(id,after.values[id]??before?.values[id]));
 const sections=[...new Set(fields.filter(f=>f.section!=='Название').map(f=>f.section))];const same=equal(before?.values,after.values);
 const value=(f:Field)=><ValueDiff field={f} before={before?.values[f.id]} after={after.values[f.id]} terms={terms}/>;
 const named=(id:string)=>{const f=fields.find(f=>f.id===id);return f?value(f):null;};
 return <div className="reading article-diff"><p className="diff-legend"><span className="legend-remove">− Удалено</span><span className="legend-add">+ Добавлено</span><span>Ярче выделены изменившиеся слова. {same?'Текст статьи не изменился.':''}</span></p><div className="breadcrumb">Словарь / {named('category')}</div><div className="diff-title">{named('term')}</div><div className="equivalent">{named('equivalent')}{(after.values.abbreviation||before?.values.abbreviation)&&<span className="badge">{named('abbreviation')}</span>}</div>{fields.filter(f=>f.section==='Название'&&!['term','equivalent','category','abbreviation'].includes(f.id)).map(f=><div key={f.id}><span className="field-caption">{f.label}</span>{value(f)}</div>)}{sections.map(section=><section key={section}><h2>{section}</h2>{fields.filter(f=>f.section===section).filter(f=>after.values[f.id]!==undefined||before?.values[f.id]!==undefined).map(f=><div key={f.id} className="article-read-field">{fields.filter(v=>v.section===section).length>1&&<span className="field-caption">{f.label}</span>}{value(f)}</div>)}</section>)}</div>;
}
