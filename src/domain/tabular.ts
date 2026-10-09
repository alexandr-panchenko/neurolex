import { DomainError, type DictionarySchema, type Document, type Field, type Json } from './model';
import { paragraph } from './mock';
export function parseTable(input: string) {
  if (input.length > 1048576) throw new DomainError('TOO_LARGE',413,'Файл превышает 1 МБ.');
  const source=input.replace(/^\uFEFF/,'');
  const first=source.split(/\r?\n/,1)[0]||'';
  const delimiter=['\t',';',','].sort((a,b)=>first.split(b).length-first.split(a).length)[0]!;
  const rows:string[][]=[];let row:string[]=[];let value='';let quoted=false;
  for(let i=0;i<source.length;i++) {const c=source[i]!;
    if(c==='"'){if(quoted&&source[i+1]==='"'){value+='"';i++;}else if(quoted||!value)quoted=!quoted;else throw new DomainError('INVALID_CSV',422,'Кавычки должны обрамлять значение целиком.');}
    else if(!quoted&&c===delimiter){row.push(value);value='';}
    else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&source[i+1]==='\n')i++;row.push(value);if(row.some(v=>v.trim()))rows.push(row);row=[];value='';}
    else value+=c;
  }
  if(quoted)throw new DomainError('INVALID_CSV',422,'Не закрыты кавычки в CSV.');
  row.push(value);if(row.some(v=>v.trim()))rows.push(row);
  const headers=(rows.shift()||[]).map(v=>v.trim());
  if(!headers.length||headers.some(v=>!v)||new Set(headers).size!==headers.length)throw new DomainError('INVALID_CSV',422,'Нужна строка уникальных названий столбцов.');
  if(rows.length>100||rows.some(r=>r.length!==headers.length))throw new DomainError('INVALID_CSV',422,'Допускается до 100 строк с одинаковым количеством столбцов.');
  return {headers,rows};
}
function convert(field:Field,value:string):Json {
  if(field.multiple){const values=value.trim().startsWith('[')?JSON.parse(value) as unknown:value.split(';').map(v=>v.trim()).filter(Boolean);if(!Array.isArray(values))throw new Error('Нужен список');return values.map(v=>typeof v==='string'?convert({...field,multiple:false},v):v as Json);}
  if(field.type==='object')return JSON.parse(value) as Json;
  if(field.type==='richText')return paragraph(value) as unknown as Json;
  if(field.type==='number'){const n=Number(value);if(!Number.isFinite(n))throw new Error('Нужно число');return n;}
  if(field.type==='boolean'){if(['true','1','да'].includes(value.toLowerCase()))return true;if(['false','0','нет'].includes(value.toLowerCase()))return false;throw new Error('Нужно да или нет');}
  return value;
}
export function tableDocuments(table:ReturnType<typeof parseTable>,mapping:Record<string,string>,schema:DictionarySchema):Document[] {
  const targets=Object.values(mapping).filter(Boolean);if(new Set(targets).size!==targets.length)throw new DomainError('INVALID_MAPPING',422,'Каждому полю должен соответствовать только один столбец.');
  return table.rows.map((row,index)=>{const values:Record<string,Json>={};let id='';
    for(const [column,target]of Object.entries(mapping)){const position=table.headers.indexOf(column);if(position<0||!target)continue;const raw=row[position]?.trim()||'';if(!raw)continue;if(target==='@id'){id=raw;continue;}
      const field=schema.fields.find(f=>f.id===target);if(!field)throw new DomainError('INVALID_MAPPING',422,'Поле отсутствует в текущей структуре: '+target);
      try{values[target]=convert(field,raw);}catch{throw new DomainError('INVALID_CSV_VALUE',422,`Строка ${index+2}, столбец «${column}»: проверьте формат значения.`);}
    }
    id||=String(values.term||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
    if(!id)throw new DomainError('INVALID_ID',422,`Строка ${index+2}: укажите идентификатор статьи.`);
    return {id,schemaVersion:schema.version,values};
  });
}
