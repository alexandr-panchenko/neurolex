import type { Field, DictionarySchema } from './model';
const vocab = 'https://neurolex-preview.sanocks.workers.dev/vocabulary#';
function field(id: string, label: string, section: string, type: Field['type'], predicate: string, extra: Partial<Field> = {}): Field {
  return { id, label, section, type, predicate, target: 'article', description: label, ...extra };
}
export const initialSchema: DictionarySchema = {
  version: 1, contextVersion: 1, categories: ['Интерфейсы', 'Методы регистрации', 'Практики саморегуляции'],
  fields: [
    field('term', 'Английский термин', 'Название', 'text', 'http://www.w3.org/2000/01/rdf-schema#label', { required: true }),
    field('equivalent', 'Русский эквивалент', 'Название', 'text', vocab + 'russianEquivalent', { required: true }),
    field('abbreviation', 'Аббревиатура', 'Название', 'text', vocab + 'abbreviation'),
    field('category', 'Категория', 'Название', 'enum', 'http://purl.org/dc/terms/subject', { options: ['Интерфейсы', 'Методы регистрации', 'Практики саморегуляции'] }),
    field('definition', 'Определение', 'Определение', 'richText', 'http://www.w3.org/2004/02/skos/core#definition', { required: true, target: 'concept' }),
    field('analysis', 'Лингвистический комментарий', 'Лингвистический комментарий', 'richText', vocab + 'researcherAnnotation'),
    field('examples', 'Примеры употребления', 'Термин в дискурсе', 'object', vocab + 'usageExample', { multiple: true, fields: [
      field('excerpt', 'Фрагмент', '', 'richText', vocab + 'excerpt', { required: true }),
      field('evidence', 'Тип свидетельства', '', 'enum', vocab + 'evidenceStatus', { required: true, options: ['synthetic', 'attested'] }),
      field('comment', 'Комментарий исследователя', '', 'richText', vocab + 'researcherAnnotation'),
      field('url', 'URL источника', '', 'reference', 'http://purl.org/dc/terms/source'),
      field('episode', 'Эпизод / серия', '', 'text', vocab + 'episodeTitle'),
      field('speaker', 'Говорящий', '', 'text', vocab + 'speaker'),
      field('start', 'Начало, секунды', '', 'number', vocab + 'startSeconds'),
      field('end', 'Конец, секунды', '', 'number', vocab + 'endSeconds'),
      field('language', 'Язык фрагмента', '', 'enum', 'http://purl.org/dc/terms/language', { options: ['ru', 'en'] }),
      field('transcriptProvenance', 'Происхождение транскрипта', '', 'text', vocab + 'transcriptProvenance'),
    ] }),
    field('related', 'Связанные понятия', 'Связанные термины', 'reference', 'http://www.w3.org/2004/02/skos/core#related', { multiple: true, target: 'concept' }),
    field('sources', 'Источники', 'Источники', 'object', 'http://purl.org/dc/terms/source', { multiple: true, fields: [
      field('id', 'Идентификатор источника', '', 'text', 'http://purl.org/dc/terms/identifier', { required: true }),
      field('title', 'Название', '', 'text', 'http://purl.org/dc/terms/title', { required: true }),
      field('url', 'Ссылка', '', 'reference', 'http://www.w3.org/2000/01/rdf-schema#seeAlso', { required: true }),
      field('note', 'Примечание / атрибуция', '', 'text', vocab + 'sourceNote'),
      field('license', 'Лицензия, если известна', '', 'text', 'http://purl.org/dc/terms/license'),
    ] }),
    field('externalMappings', 'Внешние соответствия', 'Внешние соответствия', 'object', vocab + 'externalMapping', { multiple: true, fields: [
      field('url', 'Внешний идентификатор', '', 'reference', 'http://www.w3.org/2000/01/rdf-schema#seeAlso', { required: true }),
      field('relation', 'Тип соответствия', '', 'enum', vocab + 'mappingRelation', { required: true, options: ['exactMatch', 'closeMatch', 'relatedMatch'] }),
    ] }),
  ],
};
