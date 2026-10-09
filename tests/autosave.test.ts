import {expect,test} from 'bun:test';
import {DraftSaver,type SaveEvent} from '../src/ui/DraftSaver';
import type {Document,RecordEntry} from '../src/domain/model';
const doc:Document={id:'test',schemaVersion:1,values:{term:'test'}};
const record=(document:Document,revision:number):RecordEntry=>({id:document.id,current:document,revision,published:null,publishedRevision:null,updatedAt:''});
test('autosave serializes overlapping edits and advances the expected revision',async()=>{
 const calls:{document:Document;revision:number}[]=[];let resolveFirst!:(value:RecordEntry)=>void;const events:SaveEvent[]=[];
 const saver=new DraftSaver(async(document,revision)=>{calls.push({document,revision});if(calls.length===1)return new Promise(resolve=>{resolveFirst=resolve;});return record(document,revision+1);},event=>events.push(event),100000);
 saver.register(record(doc,1));const first={...doc,values:{term:'first'}};saver.update(first);const flush=saver.flush();saver.update({...doc,values:{term:'second'}});expect(calls).toHaveLength(1);resolveFirst(record(first,2));await flush;
 expect(calls.map(c=>c.revision)).toEqual([1,2]);expect(calls[1]!.document.values.term).toBe('second');expect(events.at(-1)?.state).toBe('saved');await saver.flush();expect(calls).toHaveLength(2);
});
test('navigation flush saves immediately; conflicts retain edits without overwriting',async()=>{
 let calls=0;const events:SaveEvent[]=[];const saver=new DraftSaver(async()=>{calls++;throw Object.assign(new Error('Conflict'),{code:'REVISION_CONFLICT'});},event=>events.push(event),100000);
 saver.register(record(doc,1));saver.update({...doc,values:{term:'local change'}});await saver.flush();expect(calls).toBe(1);saver.update({...doc,values:{term:'keep my change'}});await saver.flush();expect(calls).toBe(1);expect(events.at(-1)?.state).toBe('error');
});
test('lost response retries the same idempotent payload and key',async()=>{
 const keys:string[]=[];const saver=new DraftSaver(async(document,revision,key)=>{keys.push(key);if(keys.length===1)throw new Error('Network lost');return record(document,revision+1);},()=>{},100000);
 saver.register(record(doc,1));saver.update({...doc,values:{term:'changed'}});await saver.flush();await saver.flush();expect(keys).toHaveLength(2);expect(keys[0]).toBe(keys[1]);
});
