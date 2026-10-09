import type {DictionarySchema,Field,Json} from './model';
import {paragraph} from './mock';
export function importTemplate(schema:DictionarySchema,format:'csv'|'json'){
 function value(field:Field):Json{const single=():Json=>{switch(field.type){case 'richText':return paragraph('Заполните '+field.label);case 'number':return 0;case 'boolean':return false;case 'date':return '2026-01-01';case 'enum':return field.options?.[0]||'';case 'reference':return 'https://example.org/source';case 'object':return Object.fromEntries((field.fields||[]).filter(f=>f.required).map(f=>[f.id,value(f)]));default:return 'Заполните '+field.label;}};return field.multiple?[single()]:single();}
 const fields=schema.fields.filter(f=>f.required);const values=Object.fromEntries(fields.map(f=>[f.id,value(f)]));
 if(format==='json')return JSON.stringify([{id:'your-term',schemaVersion:schema.version,values}],null,2);
 const quote=(text:string)=>'"'+text.replaceAll('"','""')+'"';
 return ['id',...fields.map(f=>f.id)].map(quote).join(',')+'\n'+['your-term',...fields.map(f=>{const v=values[f.id]!;return f.type==='richText'&&!f.multiple?'Заполните '+f.label:typeof v==='object'?JSON.stringify(v):String(v);})].map(quote).join(',')+'\n';
}
