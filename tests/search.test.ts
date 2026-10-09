import { expect, test } from 'bun:test';
import { fixtures, richSchema, searchArticles } from '../src/domain/mock';
test('search finds English, Russian and abbreviation labels, with exact labels first', () => {
  for (const query of ['BCI', 'brain', 'интерфейс мозг', 'EEG', 'электроэнцефалография', 'neurofeedback']) expect(searchArticles(fixtures, query).length).toBeGreaterThan(0);
  expect(searchArticles(fixtures, 'EEG')[0]?.id).toBe('electroencephalography');
  expect(searchArticles(fixtures, 'unknown term')).toHaveLength(0);
  expect(searchArticles([{ ...fixtures[0]!, status: 'draft' }], 'BCI')).toHaveLength(0);
});
test('rich text structure and supported marks survive serialization', () => {
  const input = { type: 'doc', content: [{ type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Analysis', marks: [{ type: 'link', attrs: { href: 'https://example.org', title: null } }, { type: 'strong' }] }] }] }] };
  expect(richSchema.nodeFromJSON(input).toJSON()).toEqual({...input,attrs:{language:null}});
  expect(richSchema.nodeFromJSON({...input,attrs:{language:'en'}}).toJSON()).toEqual({...input,attrs:{language:'en'}});
});
