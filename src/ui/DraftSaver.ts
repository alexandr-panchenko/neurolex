import type { Document, RecordEntry } from '../domain/model';
export type SaveEvent={id:string;state:'pending'|'saving'|'saved'|'error';message?:string;record?:RecordEntry;document?:Document};
type Slot={revision:number;latest:Document;acknowledged:string;timer:ReturnType<typeof setTimeout>|null;active:Promise<void>|null;blocked:boolean;request:{document:Document;key:string}|null};
/** One in-flight write per article; changes made during a write become the next revision. */
export class DraftSaver {
 private slots=new Map<string,Slot>();
 constructor(private write:(document:Document,revision:number,key:string)=>Promise<RecordEntry>,private notify:(event:SaveEvent)=>void,private delay=700){}
 register(record:RecordEntry){const old=this.slots.get(record.id);if(old?.active||old?.timer)return;this.slots.set(record.id,{revision:record.revision,latest:record.current,acknowledged:JSON.stringify(record.current),timer:null,active:null,blocked:false,request:null});}
 update(document:Document,revision=0){let slot=this.slots.get(document.id);if(!slot){slot={revision,latest:document,acknowledged:'',timer:null,active:null,blocked:false,request:null};this.slots.set(document.id,slot);}slot.latest=structuredClone(document);if(slot.timer)clearTimeout(slot.timer);if(slot.blocked){this.notify({id:document.id,state:'error',message:'Конфликт редакций. Копия сохранена в браузере; загрузите текущую редакцию перед продолжением.'});return;}if(slot.acknowledged===JSON.stringify(slot.latest)){this.notify({id:document.id,state:'saved'});return;}this.notify({id:document.id,state:'pending'});slot.timer=setTimeout(()=>{slot!.timer=null;void this.drain(document.id);},this.delay);}
 async flush(id?:string){await Promise.all([...this.slots.keys()].filter(key=>!id||key===id).map(key=>this.drain(key)));}
 private async drain(id:string):Promise<void>{const slot=this.slots.get(id)!;if(slot.timer){clearTimeout(slot.timer);slot.timer=null;}if(slot.active){await slot.active;if(!slot.blocked&&slot.acknowledged!==JSON.stringify(slot.latest))await this.drain(id);return;}if(slot.blocked||slot.acknowledged===JSON.stringify(slot.latest))return;
 slot.active=(async()=>{while(!slot.blocked&&slot.acknowledged!==JSON.stringify(slot.latest)){
 const request=slot.request||{document:structuredClone(slot.latest),key:crypto.randomUUID()};slot.request=request;this.notify({id,state:'saving'});
 try{const record=await this.write(request.document,slot.revision,request.key);slot.revision=record.revision;slot.acknowledged=JSON.stringify(request.document);slot.request=null;this.notify({id,state:slot.acknowledged===JSON.stringify(slot.latest)?'saved':'pending',record,document:request.document});}
 catch(error){const code=error&&typeof error==='object'&&'code'in error?String(error.code):'';slot.blocked=['REVISION_CONFLICT','SCHEMA_CONFLICT','CORPUS_CONFLICT'].includes(code);if(code)slot.request=null;this.notify({id,state:'error',message:error instanceof Error?error.message:'Нет связи с сервером. Копия сохранена в браузере.'});break;}
 }})();await slot.active;slot.active=null;
 }
}
