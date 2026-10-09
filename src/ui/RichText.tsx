import { richSchema, type RichDocument } from '../domain/mock';
export function RichReading({ value, highlight }: { value: RichDocument; highlight?: (text:string,offset:number)=>React.ReactNode }) {
  let offset=0;
  const node = richSchema.nodeFromJSON(value);
  function render(n: typeof node, key: number): React.ReactNode {
    if (n.isText) { let content: React.ReactNode = highlight ? highlight(n.text||'',offset) : n.text; offset+=(n.text||'').length; for (const mark of n.marks) { if (mark.type.name === 'strong') content = <strong>{content}</strong>; else if (mark.type.name === 'em') content = <em>{content}</em>; else if (mark.type.name === 'term_ref') content = <a href={'/article/'+String(mark.attrs.id)}>{content}</a>; else if (mark.type.name === 'source_ref') content = <a href={'#source-'+String(mark.attrs.id)}>{content}</a>; else if (mark.type.name === 'link' && /^https?:\/\//.test(String(mark.attrs.href))) content = <a href={String(mark.attrs.href)} rel="noreferrer">{content}</a>; } return <span key={key}>{content}</span>; }
    const children: React.ReactNode[] = []; n.forEach((child, _offset, i) => children.push(render(child, i)));
    switch (n.type.name) { case 'paragraph': return <p key={key}>{children}</p>; case 'blockquote': return <blockquote key={key}>{children}</blockquote>; case 'bullet_list': return <ul key={key}>{children}</ul>; case 'ordered_list': return <ol key={key}>{children}</ol>; case 'list_item': return <li key={key}>{children}</li>; case 'hard_break': return <br key={key}/>; case 'heading': return <h3 key={key}>{children}</h3>; default: return <div key={key}>{children}</div>; }
  }
  return render(node, 0);
}
