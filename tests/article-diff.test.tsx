import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server.browser';
import { ArticleDiff } from '../src/ui/ArticleDiff';
import { wordDiff } from '../src/ui/diff';
import { initialSchema } from '../src/domain/schema-definition';
import { paragraph } from '../src/domain/mock';
import type { Document } from '../src/domain/model';
test('Russian word diff preserves punctuation and reconstructs both versions',()=>{
 const before='Метод измерения мозговой активности.',after='Метод обучения мозговой активности.';const result=wordDiff(before,after);
 expect(result.filter(p=>p.kind!=='add').map(p=>p.value).join('')).toBe(before);
 expect(result.filter(p=>p.kind!=='remove').map(p=>p.value).join('')).toBe(after);
 expect(result.filter(p=>p.kind==='remove').map(p=>p.value).join('')).toBe('измерения');
 expect(result.filter(p=>p.kind==='add').map(p=>p.value).join('')).toBe('обучения');
});
test('article diff renders unchanged context and formatted changed paragraphs, including deletion',()=>{
 const before:Document={id:'test',schemaVersion:1,values:{term:'test',equivalent:'тест',definition:paragraph('Метод измерения активности.'),analysis:paragraph('Комментарий сохранён.'),abbreviation:'OLD'}};
 const after:Document={...before,values:{term:'test',equivalent:'тест',definition:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Метод обучения активности.',marks:[{type:'strong'},{type:'term_ref',attrs:{id:'electroencephalography'}}]}]}]},analysis:before.values.analysis!}};
 const html=renderToStaticMarkup(<ArticleDiff before={before} after={after} schema={initialSchema} terms={[]}/>);
 expect(html).toContain('Комментарий сохранён.');expect(html).toContain('<mark>измерения</mark>');expect(html).toContain('<mark>обучения</mark>');expect(html).toContain('<strong>');expect(html).toContain('href="/article/electroencephalography"');expect(html).toContain('OLD');expect(html).not.toContain('[object Object]');
});
