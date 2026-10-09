import { fixtures, paragraph } from '../src/domain/mock';
import { initialSchema, validateDocument } from '../src/domain/schema';
import type { Document, RecordEntry, Revision } from '../src/domain/model';
const quote=(v:unknown)=>"'"+JSON.stringify(v).replaceAll("'","''")+"'";
const time='2026-10-09T00:00:00.000Z'; const lines=[`INSERT OR IGNORE INTO schemas(version,body,actor,created_at) VALUES(1,${quote(initialSchema)},'sample-import','${time}');`];
for(const a of fixtures){
 const doc:Document={ id:a.id,schemaVersion:1,values:{ term:a.term,equivalent:a.equivalent,abbreviation:a.abbreviation,category:a.category,definition:paragraph(a.definition),analysis:a.analysis,examples:[{ excerpt:paragraph(a.example),evidence:'synthetic',comment:paragraph(a.exampleComment),language:'ru' }],sources:a.sources.map((s,i)=>({id:'source-'+(i+1),...s})),related:a.related,externalMappings:[],sampleRecord:true } };
 validateDocument(initialSchema,doc);
 const record:RecordEntry={id:a.id,revision:1,current:doc,published:doc,publishedRevision:1,updatedAt:time};
 const revision:Revision={revision:1,document:doc,actor:'sample-import',origin:'import',time,action:'seed-sample'};
 lines.push(`INSERT OR IGNORE INTO articles(id,body) VALUES('${a.id}',${quote(record)});`);
 lines.push(`INSERT OR IGNORE INTO revisions(article_id,revision,body) VALUES('${a.id}',1,${quote(revision)});`);
}
await Bun.write('migrations/0002_samples.sql',lines.join('\n')+'\n');
