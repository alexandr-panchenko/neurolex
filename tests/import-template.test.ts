import {expect,test} from 'bun:test';
import {importTemplate} from '../src/domain/import-template';
import {initialSchema,validateDocument} from '../src/domain/schema';
import {parseTable,tableDocuments} from '../src/domain/tabular';
test('CSV and JSON templates round-trip the active schema including required nested and repeated values',()=>{
 const schema=structuredClone(initialSchema);schema.version=9;schema.fields.push({id:'metadata',label:'Metadata',description:'',section:'Metadata',type:'object',required:true,multiple:true,predicate:'https://example.test/metadata',target:'article',fields:[{id:'date',label:'Date',description:'',section:'',type:'date',required:true,predicate:'https://example.test/date',target:'article'}]});
 const json=JSON.parse(importTemplate(schema,'json'));expect(validateDocument(schema,json[0]).schemaVersion).toBe(9);
 const table=parseTable(importTemplate(schema,'csv'));const mapping=Object.fromEntries(table.headers.map(header=>[header,header==='id'?'@id':header]));const [csv]=tableDocuments(table,mapping,schema);expect(validateDocument(schema,csv)).toEqual(json[0]);
});
