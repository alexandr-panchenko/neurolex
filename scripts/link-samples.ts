import { fixtures, paragraph } from '../src/domain/mock';
import type { Document, Json, RecordEntry, Revision } from '../src/domain/model';
import { readFileSync } from 'node:fs';
// Seed-link enrichment is a recorded migration, not a change to existing SQL migration contents.
const statements:string[]=[];const quote=(v:unknown)=>"'"+JSON.stringify(v).replaceAll("'","''")+"'";
function linked(input:string):Json{
 const parts=input.split(/(EEG|BCI)/g);return {type:'doc',content:[{type:'paragraph',content:parts.filter(Boolean).map((part)=>({type:'text',text:part,...(part==='EEG'||part==='BCI'?{marks:[{type:'term_ref',attrs:{id:part==='EEG'?'electroencephalography':'brain-computer-interface'}}]}:{})}))}]};
}
for(const a of fixtures){
 const match=readFileSync('migrations/0002_samples.sql','utf8').split('\n').find((s)=>s.startsWith(`INSERT OR IGNORE INTO articles(id,body) VALUES('${a.id}',`))!;
 const raw=match.slice(match.indexOf(",'" )+2,-3).replaceAll("''","'");const old=JSON.parse(raw) as RecordEntry;
 const definition=paragraph(a.definition) as {content:{content:{type:string;text:string;marks?:unknown[]}[]}[]};definition.content[0]!.content.push({type:'text',text:' [1]',marks:[{type:'source_ref',attrs:{id:'source-1'}}]});
 const document:Document={...old.current,values:{...old.current.values,definition:definition as unknown as Json,analysis:linked(a.analysis.content[0].content[0].text)}};
 const time='2026-10-09T12:00:00.000Z';const record:RecordEntry={...old,revision:2,publishedRevision:2,current:document,published:document,updatedAt:time};const revision:Revision={revision:2,document,actor:'sample-import',origin:'import',time,action:'add-source-and-term-links'};
 statements.push(`UPDATE articles SET body=${quote(record)} WHERE id='${a.id}';`);statements.push(`INSERT OR IGNORE INTO revisions(article_id,revision,body) VALUES('${a.id}',2,${quote(revision)});`);
}
statements.push('UPDATE control SET revision=revision+1 WHERE id=1;');
await Bun.write('migrations/0003_sample_links.sql',statements.join('\n')+'\n');
