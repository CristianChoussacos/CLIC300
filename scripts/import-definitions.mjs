// Importador reproducible de Wikcionario (Kaikki / Wiktextract), CC BY-SA 4.0.
// Uso: node scripts/import-definitions.mjs ../es-extract.jsonl.gz
import {createReadStream} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {createGunzip} from 'node:zlib';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import nspell from 'nspell';
import es from 'dictionary-es';
import {entries} from '../src/education.js';
import {normalize} from '../src/search.js';
import {DEFINITION_SHARDS,definitionShard} from '../src/definitions.js';

const input = process.argv[2];
if (!input) throw new Error('Indicá el archivo es-extract.jsonl.gz descargado de Kaikki.');
const allowed = new Set([...Object.keys(nspell(es).data),...entries.map(entry => entry.word)].map(normalize));
const records = new Map();
const validWord = word => typeof word === 'string' && word.length <= 40 && /^[a-záéíóúüñ]+(?: [a-záéíóúüñ]+)?$/iu.test(word);
const record = word => {
  word = word.trim().normalize('NFC');
  if (!records.has(word)) records.set(word,{d:[],f:[],explicit:[]});
  return records.get(word);
};
const link = (word,lemma,explicit = false) => {
  if (!validWord(word) || !validWord(lemma) || normalize(word) === normalize(lemma) || !allowed.has(normalize(word))) return;
  const row = record(word);
  const links = explicit ? row.explicit : row.f;
  if (!links.includes(lemma)) links.push(lemma);
};
// La entrada propia de una forma tiene prioridad sobre tablas de otros lemas.
const linksOf = row => row.explicit.length ? row.explicit : row.f;
const positions = {noun:'Sustantivo',verb:'Verbo',adj:'Adjetivo',adv:'Adverbio',name:'Nombre propio',prep:'Preposición',pron:'Pronombre',conj:'Conjunción',intj:'Interjección',article:'Artículo',num:'Numeral',phrase:'Expresión',participle:'Participio'};
const translatedTags = {rare:'Poco frecuente',obsolete:'En desuso',archaic:'Antiguo',dated:'Antiguo',vulgar:'Vulgar',colloquial:'Coloquial',figuratively:'Sentido figurado',informal:'Informal'};
let rows = 0;
for await (const line of createInterface({input:createReadStream(input).pipe(createGunzip()),crlfDelay:Infinity})) {
  rows++;
  if (!line) continue;
  const item = JSON.parse(line);
  if (item.lang_code !== 'es' || !validWord(item.word)) continue;
  const word = item.word.normalize('NFC');
  const row = record(word);
  for (const sense of item.senses ?? []) {
    if (sense.form_of?.length) {
      for (const lemma of sense.form_of) link(word,lemma.word,true);
      continue;
    }
    if (sense.tags?.includes('form-of') || sense.tags?.includes('no-gloss')) continue;
    const text = sense.glosses?.filter(gloss => typeof gloss === 'string' && gloss.trim()).join(' ').replace(/\s+/gu,' ').trim();
    if (!text || text.length > 4000 || row.d.some(definition => definition[1] === text) || row.d.length >= 8) continue;
    const labels = [...new Set([...(sense.raw_tags ?? []),...(sense.tags ?? []).map(tag => translatedTags[tag]).filter(Boolean)])].filter(label => typeof label === 'string' && label.length <= 70).slice(0,4);
    row.d.push([item.pos_title || positions[item.pos] || 'Palabra',text,...(labels.length ? [labels] : [])]);
  }
  // Estas relaciones vienen de tablas del diccionario; no se adivinan sufijos.
  for (const form of item.forms ?? []) link(form.form,word);
  if (rows % 200000 === 0) console.log(`${rows.toLocaleString('es')} filas procesadas…`);
}

// Conserva las definiciones y las referencias que llevan a alguna definición.
function hasDefinition(word,seen = new Set(),depth = 0) {
  if (depth > 4 || seen.has(word)) return false;
  const row = records.get(word) ?? records.get(normalize(word));
  if (!row) return false;
  if (row.d.length) return true;
  return linksOf(row).some(lemma => hasDefinition(lemma,new Set(seen).add(word),depth + 1));
}
const shards = Array.from({length:DEFINITION_SHARDS},() => ({}));
let direct = 0;
let forms = 0;
let senseCount = 0;
for (const word of [...records.keys()].sort()) {
  const row = records.get(word);
  if (!hasDefinition(word)) continue;
  const data = {};
  if (row.d.length) { data.d = row.d; direct++; senseCount += row.d.length; }
  else { data.f = linksOf(row).filter(lemma => hasDefinition(lemma)).slice(0,2); forms++; }
  shards[definitionShard(word)][word] = data;
}
await mkdir('data/definitions',{recursive:true});
const files = [];
for (let i = 0; i < shards.length; i++) {
  const name = `definitions-${i.toString(16).padStart(2,'0')}.json`;
  const content = JSON.stringify(shards[i])+'\n';
  await writeFile(`data/definitions/${name}`,content);
  files.push({name,bytes:Buffer.byteLength(content),sha256:createHash('sha256').update(content).digest('hex')});
}
const sourceHash = createHash('sha256');
for await (const chunk of createReadStream(input)) sourceHash.update(chunk);
const metadata = {
  source:'Wikcionario en español, autores y colaboradores; extracción Kaikki / Wiktextract, Tatu Ylonen',
  sourceUrl:'https://kaikki.org/eswiktionary/',
  downloadUrl:'https://kaikki.org/dictionary/downloads/es/es-extract.jsonl.gz',
  sourceLastModified:'2026-09-28T15:20:33Z',
  sourceSha256:sourceHash.digest('hex'),
  license:'CC-BY-SA-4.0',
  licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
  directEntries:direct,linkedForms:forms,senses:senseCount,
  totalBytes:files.reduce((sum,file) => sum+file.bytes,0),
  modifications:'Selección de entradas españolas de hasta dos palabras, espacios normalizados, hasta ocho acepciones y relaciones de formas a lemas. Se priorizan las relaciones de la entrada propia sobre tablas de conjugación. No se incluyen traducciones, citas ni ejemplos de obras externas.',
  files
};
await writeFile('data/definitions/metadata.json',JSON.stringify(metadata,null,2)+'\n');
console.log(`Definiciones: ${direct.toLocaleString('es')} entradas, ${forms.toLocaleString('es')} formas relacionadas, ${(metadata.totalBytes/1024/1024).toFixed(1)} MiB.`);
