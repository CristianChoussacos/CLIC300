import {normalize} from './search.js';

export const DEFINITION_SHARDS = 64;
export function definitionShard(word) {
  let hash = 2166136261;
  for (const letter of normalize(word)) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619);
  return (hash >>> 0) % DEFINITION_SHARDS;
}
export function definitionFile(word) {
  return `definitions-${definitionShard(word).toString(16).padStart(2, '0')}.json`;
}
export function sourceUrl(word) {
  return `https://es.wiktionary.org/wiki/${encodeURIComponent(word)}#Español`;
}

// Se leen pequeños archivos locales. Las consultas no se envían a Wikcionario.
export class DefinitionStore {
  constructor(base, fetchFile) {
    this.base = base;
    this.fetchFile = fetchFile ?? (async file => {
      const response = await fetch(new URL(`./data/definitions/${file}`, base), {signal:AbortSignal.timeout(8000)});
      if (!response.ok) throw new Error('No se pudo cargar la definición');
      return response.json();
    });
    this.files = new Map();
  }

  async read(word) {
    const file = definitionFile(word);
    if (!this.files.has(file)) {
      const pending = this.fetchFile(file).catch(error => { this.files.delete(file); throw error; });
      this.files.set(file, pending);
    }
    const data = await this.files.get(file);
    const original = word.trim().normalize('NFC');
    const lower = normalize(original);
    const key = [original,lower,lower[0]?.toLocaleUpperCase('es') + lower.slice(1),lower.toLocaleUpperCase('es')].find(candidate => Object.hasOwn(data, candidate));
    return key ? {key,record:data[key]} : null;
  }

  async resolve(word, visited = new Set(), depth = 0) {
    if (depth > 4) return {status:'missing',senses:[],sources:[],formOf:[]};
    const entry = await this.read(word);
    if (!entry || visited.has(entry.key)) return {status:'missing',senses:[],sources:[],formOf:[]};
    const seen = new Set(visited).add(entry.key);
    const senses = (entry.record.d ?? []).map(([pos,text,labels = []]) => ({pos,text,labels,sourceWord:entry.key}));
    if (senses.length) return {status:'found',senses,sources:[entry.key],formOf:[]};
    const formOf = (entry.record.f ?? []).slice(0,2);
    const definitions = await Promise.all(formOf.map(lemma => this.resolve(lemma,seen,depth + 1)));
    const found = definitions.filter(result => result.status === 'found');
    const inherited = found.flatMap(result => result.senses).slice(0,8);
    return {status:inherited.length ? 'found' : 'missing',senses:inherited,sources:[entry.key,...new Set(found.flatMap(result => result.sources))],formOf:formOf.filter((lemma,index) => definitions[index].status === 'found')};
  }

  async lookup(word) {
    try { return await this.resolve(word); }
    catch { return {status:'unavailable',senses:[],sources:[],formOf:[]}; }
  }
}
