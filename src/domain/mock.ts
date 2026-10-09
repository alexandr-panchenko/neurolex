import type { Node as ProseMirrorNode } from 'prosemirror-model';
import { schema as basic } from 'prosemirror-schema-basic';
import { Schema } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
export const richSchema = new Schema({ nodes: addListNodes(basic.spec.nodes.update('doc', { ...basic.spec.nodes.get('doc')!, attrs: { language: { default: null } } }), 'paragraph block*', 'block'), marks: basic.spec.marks.addToEnd('term_ref', { attrs: { id: {} }, inclusive: false, toDOM: (mark) => ['a', { href: '/article/' + String(mark.attrs.id), 'data-term-id': mark.attrs.id }, 0], parseDOM: [{ tag: 'a[data-term-id]', getAttrs: (dom) => ({ id: dom.getAttribute('data-term-id') }) }] }).addToEnd('source_ref', { attrs: { id: {} }, inclusive: false, toDOM: (mark) => ['a', { href: '#source-' + String(mark.attrs.id), 'data-source-id': mark.attrs.id }, 0], parseDOM: [{ tag: 'a[data-source-id]', getAttrs: (dom) => ({ id: dom.getAttribute('data-source-id') }) }] }) });
export type RichDocument = ReturnType<ProseMirrorNode['toJSON']>;
export interface Source { title: string; url: string; note: string }
export interface Article {
  id: string; term: string; equivalent: string; abbreviation: string; category: string;
  definition: string; analysis: RichDocument; example: string; exampleComment: string;
  sources: Source[]; related: string[]; revision: number; status: 'published' | 'draft';
}
export const paragraph = (text: string): RichDocument => ({ type: 'doc', content: [{ type: 'paragraph', ...(text ? { content: [{ type: 'text', text }] } : {}) }] });
export const fixtures: Article[] = [
  { id: 'brain-computer-interface', term: 'brain–computer interface', equivalent: 'интерфейс мозг–компьютер', abbreviation: 'BCI', category: 'Интерфейсы', revision: 1, status: 'published',
    definition: 'Система коммуникации или управления, которая преобразует сигналы активности мозга в команды внешнему устройству, предоставляя канал взаимодействия, не зависящий от мышечного управления.',
    analysis: paragraph('Английский многокомпонентный термин объединяет brain и computer как участников взаимодействия. Русский эквивалент сохраняет эту структуру. Аббревиатура BCI обозначает полное выражение, а не отдельный концепт. В популярном объяснении термин может сближаться с метафорой «чтения мыслей»: такое употребление требует анализа контекста и не должно автоматически становиться новым значением термина.'),
    example: 'Представьте, что сигнал мозга становится командой для курсора — это и есть интерфейс мозг–компьютер.',
    exampleComment: 'Объяснительная парафраза через конкретный сценарий управления. Пример создан для демонстрации интерфейса; это не цитата из подкаста.',
    sources: [{ title: 'Wolpaw et al. · Brain-computer interfaces for communication and control (2002)', url: 'https://pubmed.ncbi.nlm.nih.gov/12048038/', note: 'Определение выше — редакторский пересказ, не дословная цитата.' }, { title: 'Wolpaw, Millán & Ramsey · Definitions and principles (2020)', url: 'https://pubmed.ncbi.nlm.nih.gov/32164849/', note: 'Дополнительный материал о принципах BCI.' }], related: ['electroencephalography', 'neurofeedback'] },
  { id: 'electroencephalography', term: 'electroencephalography', equivalent: 'электроэнцефалография', abbreviation: 'EEG', category: 'Методы регистрации', revision: 1, status: 'published',
    definition: 'Метод регистрации электрической активности мозга с помощью электродов, размещённых на коже головы.',
    analysis: paragraph('В статье различаются метод — electroencephalography — и результат регистрации — electroencephalogram. В англоязычном дискурсе сокращение EEG может обозначать и метод, и запись: интерпретацию следует устанавливать по контексту. Русское ЭЭГ также требует контекстного уточнения. Применение EEG в BCI не делает эти термины синонимами: первый обозначает способ регистрации, второй — систему взаимодействия.'),
    example: 'Мы записали EEG, а затем посмотрели, как менялся сигнал во время задания.', exampleComment: 'Синтетический пример: «EEG» здесь обозначает запись. Серия, говорящий и таймкод отсутствуют, поскольку источник не засвидетельствован.',
    sources: [{ title: 'NINDS · Neurological Diagnostic Tests and Procedures', url: 'https://www.ninds.nih.gov/health-information/disorders/neurological-diagnostic-tests-and-procedures', note: 'Редакторский пересказ раздела Electroencephalography.' }], related: ['brain-computer-interface', 'neurofeedback'] },
  { id: 'neurofeedback', term: 'neurofeedback', equivalent: 'нейрообратная связь', abbreviation: '', category: 'Практики саморегуляции', revision: 1, status: 'published',
    definition: 'Метод обучения саморегуляции мозговой активности через обратную связь, предоставляемую человеку на основе измеряемых сигналов.',
    analysis: paragraph('Сложное слово neurofeedback сочетает указание на нейронную активность с понятием обратной связи. В русскоязычных материалах встречаются как калька, так и заимствование. EEG-based neurofeedback обозначает частный случай: не вся нейрообратная связь основана на EEG. Различайте описание метода, обещание эффекта и исследовательскую интерпретацию.'),
    example: 'На экране меняется индикатор, а участник пробует научиться влиять на него, наблюдая обратную связь.', exampleComment: 'Синтетический учебный пример объяснения через интерфейс. Это не доказательство эффективности метода и не реальный подкастовый фрагмент.',
    sources: [{ title: 'NLM MeSH · Neurofeedback', url: 'https://www.ncbi.nlm.nih.gov/mesh/D058765', note: 'Редакторский пересказ определения контролируемого словаря.' }, { title: 'Sitaram et al. · Closed-loop brain training: the science of neurofeedback', url: 'https://www.nature.com/articles/nrn.2016.164', note: 'Обзор разных методов регистрации и принципов обратной связи.' }], related: ['electroencephalography', 'brain-computer-interface'] },
];
export function searchArticles(articles: Article[], query: string): Article[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return articles.filter((a) => a.status === 'published');
  const score = (a: Article) => {
    const labels = [a.term, a.equivalent, a.abbreviation].map((s) => s.toLocaleLowerCase());
    return labels.includes(q) ? 3 : labels.some((s) => s.includes(q)) ? 2 : `${a.definition} ${richSchema.nodeFromJSON(a.analysis).textContent}`.toLocaleLowerCase().includes(q) ? 1 : 0;
  };
  return articles.filter((a) => a.status === 'published' && score(a) > 0).sort((a, b) => score(b) - score(a));
}
