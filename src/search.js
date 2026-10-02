import {entries, entryByWord, homophoneGroups, relatedGroups} from './education.js';

export function normalize(text) {
  return text.trim().normalize('NFC').toLocaleLowerCase('es').replace(/\s+/g, ' ');
}

// La ñ permanece distinta de la n. Una tilde cambia el sentido de algunas palabras.
export function fold(text) {
  return normalize(text).replace(/[áéíóúü]/g, c => ({á:'a',é:'e',í:'i',ó:'o',ú:'u',ü:'u'})[c]);
}

export function phonetic(text) {
  return fold(text).replace(/ch/g, '§').replace(/h/g, '').replace(/§/g, 'ch')
    .replace(/v/g, 'b').replace(/z/g, 's').replace(/c(?=[ei])/g, 's').replace(/ll/g, 'y')
    .replace(/qu(?=[ei])/g, 'k').replace(/c(?=[aou])/g, 'k');
}

export function distance(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 4;
  let prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) next[j] = Math.min(next[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = next;
  }
  return prev[b.length];
}

export function validateQuery(raw) {
  const query = normalize(raw);
  if (!query) return {query, error: ''};
  if (query.length > 40) return {query, error: 'Probá con una palabra de hasta 40 letras.'};
  if (!/^[a-záéíóúüñ]+(?: [a-záéíóúüñ]+)?$/i.test(query)) return {query, error: 'Escribí una palabra, sin números ni signos. También podés consultar «a ver» y «por qué».'};
  if (query.includes(' ') && !entryByWord.has(query)) return {query, error: 'Consultá una palabra por vez. Para revisar una oración, buscá cada palabra que te genere una duda.'};
  return {query, error: ''};
}

export function createSearchEngine(spell, dic = '') {
  const index = new Map();
  const add = word => {
    if (!/^[a-záéíóúüñ]+$/i.test(word) || word.length > 40) return;
    const key = phonetic(word);
    if (!index.has(key)) index.set(key, []);
    const bucket = index.get(key);
    if (!bucket.includes(word)) bucket.push(word);
  };
  for (const line of dic.split(/\r?\n/).slice(1)) add(line.split(/[\/\t ]/)[0]);
  entries.forEach(entry => add(entry.word));

  return raw => {
    const {query, error} = validateQuery(raw);
    if (!query || error) return {query, error, correct: false, results: []};
    const key = phonetic(query);
    const known = entryByWord.has(query);
    const correct = known || Boolean(spell?.correct(query));
    const candidates = new Map();
    const offer = (word, priority) => {
      const lower = normalize(word);
      if (!entryByWord.has(lower) && !spell?.correct(word)) return;
      const current = candidates.get(lower);
      if (!current || priority < current.priority) candidates.set(lower, {word: entryByWord.get(lower)?.word ?? word, priority});
    };
    if (correct) offer(entryByWord.get(query)?.word ?? query, 0);
    for (const group of [...homophoneGroups, ...relatedGroups]) {
      if (group.some(word => normalize(word) === query || phonetic(word) === key)) group.forEach(word => offer(word, 1));
    }
    for (const entry of entries) {
      if (normalize(entry.mistake ?? '') === query || phonetic(entry.word) === key) offer(entry.word, 2);
    }
    // Una palabra reconocida no se reemplaza por otras parecidas sin motivo.
    if (!correct) {
      for (const word of index.get(key) ?? []) offer(word, 3);
      if (candidates.size === 0 && spell && query.length <= 28) spell.suggest(query).slice(0, 12).forEach(word => offer(word, phonetic(word) === key ? 3 : 6));
      if (candidates.size === 0) {
        const close = entries.filter(e => distance(fold(e.word), fold(query)) <= (query.length < 5 ? 1 : 2));
        close.sort((a,b) => distance(fold(a.word),fold(query)) - distance(fold(b.word),fold(query))).slice(0,3).forEach(e => offer(e.word, 5));
      }
    }
    const results = [...candidates.values()].sort((a, b) => a.priority - b.priority || distance(query, normalize(a.word)) - distance(query, normalize(b.word)) || a.word.localeCompare(b.word, 'es')).slice(0, 6).map(({word}) => ({word, ...entryByWord.get(normalize(word))}));
    return {query, correct, error: '', limited: !spell, results};
  };
}

export function makeQuestion(word) {
  const entry = entryByWord.get(normalize(word));
  if (!entry) {
    const chars = [...word];
    const position = Math.floor(chars.length / 2);
    const answer = chars[position];
    if (!answer || validateQuery(word).error) return null;
    chars[position] = '＿';
    const alternatives = [...new Set([answer, ...'abveioucnzsj'])].slice(0, 4);
    return {word, answer, prompt: `Recordá tu palabra del cuaderno: «${chars.join('')}»`, options: alternatives, tip:`Guardaste «${word}». Mirá con atención sus letras.`, kind:'memory'};
  }
  const group = homophoneGroups.find(g => g.some(w => normalize(w) === normalize(word)));
  const options = group ?? [entry.word, entry.mistake];
  if (options.length < 2 || !options.every(Boolean)) return null;
  const expression = entry.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const prompt = entry.example.replace(new RegExp(`(?<![a-záéíóúüñ])${expression}(?![a-záéíóúüñ])`, 'iu'), '_____');
  return {word: entry.word, answer: entry.word, prompt, options, tip: entry.tip, kind:'sentence'};
}
