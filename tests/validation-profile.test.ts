import {expect,test} from 'bun:test';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {jsonSchema,initialSchema,validateDocument} from '../src/domain/schema';
import {paragraph} from '../src/domain/mock';
import {searchScore} from '../src/domain/query';
import type {Document,DictionarySchema} from '../src/domain/model';
test('runtime-safe validation agrees with generated JSON Schema for supported shape constraints',()=>{
 const schema:DictionarySchema={...initialSchema,fields:[...initialSchema.fields,{id:'date',label:'Дата',description:'Date',section:'Анализ',type:'date',predicate:'https://example.org/date',target:'article'},{id:'number',label:'Число',description:'Number',section:'Анализ',type:'number',predicate:'https://example.org/number',target:'article'},{id:'flags',label:'Признаки',description:'Flags',section:'Анализ',type:'boolean',multiple:true,required:true,predicate:'https://example.org/flags',target:'article'}]};
 const ajv=new Ajv({allErrors:true});addFormats(ajv);const validate=ajv.compile(jsonSchema(schema));
 const good:Document={id:'test',schemaVersion:1,values:{term:'Test',equivalent:'Тест',definition:paragraph('Definition'),flags:[true],date:'2026-10-09',number:1}};
 for(const input of [good,{...good,schemaVersion:2},{...good,id:'BAD ID'},...[{term:''},{term:'  '},{date:'2026-02-30'},{number:'one'},{flags:[]},{flags:[1]},{sources:[{id:'s'}]}].map((values)=>({...good,values:{...good.values,...values}}))]){
  let accepted=true;try{validateDocument(schema,input);}catch{accepted=false;}expect(accepted).toBe(validate(input));
 }
 expect(searchScore(good,'что означает Test')).toBeGreaterThan(0);
});
