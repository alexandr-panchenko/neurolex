import { useEffect, useRef, useState } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { baseKeymap, toggleMark, wrapIn, setBlockType } from 'prosemirror-commands';
import { history, undo, redo } from 'prosemirror-history';
import { wrapInList } from 'prosemirror-schema-list';
import { keymap } from 'prosemirror-keymap';
import { richSchema, type RichDocument } from '../domain/mock';
export function RichEditor({ value, onChange, terms = [], sources = [], label = 'Форматированный текст' }: { value: RichDocument; onChange: (doc: RichDocument) => void; terms?: { id: string; label: string }[]; sources?: { id: string; label: string }[]; label?: string }) {
  const [linkOpen,setLinkOpen]=useState(false);const [linkUrl,setLinkUrl]=useState('');
  const mount = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView | null>(null);
  const initial = useRef(value);
  const change = useRef(onChange);
  useEffect(() => { change.current = onChange; }, [onChange]);
  useEffect(() => {
    if (!mount.current) return;
    const view = new EditorView(mount.current, {
      state: EditorState.create({ doc: richSchema.nodeFromJSON(initial.current), plugins: [history(), keymap({ 'Mod-z': undo, 'Mod-Shift-z': redo, 'Mod-b': toggleMark(richSchema.marks.strong!), 'Mod-i': toggleMark(richSchema.marks.em!) }), keymap(baseKeymap)] }),
      attributes: { 'aria-label': label, role: 'textbox', 'aria-multiline': 'true' },
      dispatchTransaction(tr) { view.updateState(view.state.apply(tr)); if (tr.docChanged) change.current(view.state.doc.toJSON()); },
    });
    editor.current = view;
    return () => { view.destroy(); editor.current = null; };
  }, [label]);
  return <div className="rich-editor"><div className="toolbar" aria-label="Форматирование">
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { const v = editor.current; if (v) { toggleMark(richSchema.marks.strong!)(v.state, v.dispatch); v.focus(); } }}><strong>Жирный</strong></button>
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { const v = editor.current; if (v) { toggleMark(richSchema.marks.em!)(v.state, v.dispatch); v.focus(); } }}><em>Курсив</em></button>
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { const v = editor.current; if (v) { wrapIn(richSchema.nodes.blockquote!)(v.state, v.dispatch); v.focus(); } }}>Цитата</button>
    <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={()=>{const v=editor.current;if(v){wrapInList(richSchema.nodes.bullet_list!)(v.state,v.dispatch);v.focus();}}}>Список</button>
    <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={()=>{const v=editor.current;if(v){setBlockType(richSchema.nodes.heading!,{level:3})(v.state,v.dispatch);v.focus();}}}>Подзаголовок</button>
    <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>setLinkOpen(!linkOpen)}>Внешняя ссылка</button>
    {linkOpen&&<div className="inline-link-form"><input aria-label="URL ссылки" placeholder="https://…" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)}/><button type="button" disabled={!/^https?:\/\//.test(linkUrl)} onClick={()=>{const v=editor.current;if(v){toggleMark(richSchema.marks.link!,{href:linkUrl})(v.state,v.dispatch);v.focus();}setLinkOpen(false);setLinkUrl('');}}>Вставить ссылку</button></div>}
    <button type="button" onClick={() => { const v = editor.current; if (v) undo(v.state, v.dispatch); }}>Отменить</button>
  <select aria-label="Вставить ссылку на термин" defaultValue="" onChange={(e) => { const v=editor.current; if(v && e.target.value) { toggleMark(richSchema.marks.term_ref!, { id: e.target.value })(v.state,v.dispatch); v.focus(); } e.target.value=''; }}><option value="">Ссылка на термин…</option>{terms.map((t)=><option key={t.id} value={t.id}>{t.label}</option>)}</select>
    <select aria-label="Вставить ссылку на источник" defaultValue="" onChange={(e) => { const v=editor.current; if(v && e.target.value) { toggleMark(richSchema.marks.source_ref!, { id: e.target.value })(v.state,v.dispatch); v.focus(); } e.target.value=''; }}><option value="">Ссылка на источник…</option>{sources.map((s)=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
  </div><div ref={mount}/></div>;
}
