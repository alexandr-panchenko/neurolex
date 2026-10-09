import type { Document, Json } from './model';
import { text } from './export';
const normalize=(value:string)=>value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const stop=new Set(['что','это','такое','как','означает','значит','про','расскажи','об','о','what','is','a','an','the','explain']);
function content(value:Json):string { if(typeof value==='string')return value;if(Array.isArray(value))return value.map(content).join(' ');if(value&&typeof value==='object'){if(value.type==='doc')return text(value);return Object.values(value).map(content).join(' ');}return ''; }
export function searchScore(doc:Document,query:string){
 const q=normalize(query);if(!q)return 1;
 const labels=['term','equivalent','abbreviation'].map((key)=>normalize(text(doc.values[key])));
 if(labels.includes(q))return 4;if(labels.some((label)=>label.includes(q)))return 3;
 const tokens=q.split(' ').filter((token)=>!stop.has(token)&&token.length>=2);
 if(tokens.some((token)=>labels.includes(token)))return 2;
 const body=normalize(content(doc.values));return tokens.length&&tokens.some((token)=>body.includes(token))?1:0;
}
