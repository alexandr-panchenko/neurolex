export interface Part<T> { kind: 'equal' | 'remove' | 'add'; value: T }
/** Bounded LCS: unchanged tokens keep their context; large replacements stay responsive. */
export function sequenceDiff<T>(before:T[],after:T[],same:(a:T,b:T)=>boolean):Part<T>[] {
 let start=0;while(start<before.length&&start<after.length&&same(before[start]!,after[start]!))start++;
 let end=0;while(end<before.length-start&&end<after.length-start&&same(before[before.length-1-end]!,after[after.length-1-end]!))end++;
 const a=before.slice(start,before.length-end),b=after.slice(start,after.length-end);
 const result:Part<T>[]=before.slice(0,start).map(value=>({kind:'equal',value}));
 if(a.length*b.length>500000){result.push(...a.map(value=>({kind:'remove' as const,value})),...b.map(value=>({kind:'add' as const,value})));}
 else {
 const table=Array.from({length:a.length+1},()=>new Uint32Array(b.length+1));
 for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)table[i]![j]=same(a[i]!,b[j]!)?table[i+1]![j+1]!+1:Math.max(table[i+1]![j]!,table[i]![j+1]!);
 let i=0,j=0;while(i<a.length||j<b.length){if(i<a.length&&j<b.length&&same(a[i]!,b[j]!)){result.push({kind:'equal',value:a[i++]!});j++;}else if(i<a.length&&(j===b.length||table[i+1]![j]!>=table[i]![j+1]!))result.push({kind:'remove',value:a[i++]!});else result.push({kind:'add',value:b[j++]!});}
 }
 result.push(...before.slice(before.length-end).map(value=>({kind:'equal' as const,value})));return result;
}
export function wordDiff(before:string,after:string){
 const tokens=(s:string)=>s.match(/[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}_\s]/gu)||[];
 return sequenceDiff(tokens(before),tokens(after),(a,b)=>a===b);
}
export function ranges(parts:Part<string>[],side:'remove'|'add'){
 let offset=0;return parts.filter(p=>p.kind==='equal'||p.kind===side).map(p=>{const range={start:offset,end:offset+p.value.length,changed:p.kind===side};offset=range.end;return range;});
}
