import nspell from 'nspell';
import {createSearchEngine} from './search.js';

let engine;
async function load() {
  try {
    const data = await Promise.all(['es.aff', 'es.dic'].map(async file => {
      const response = await fetch(new URL(`../data/${file}`, self.location.href));
      if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
      return response.text();
    }));
    const spell = nspell(data[0], data[1]);
    engine = createSearchEngine(spell, data[1]);
    self.postMessage({type: 'ready', count: Number(data[1].split('\n', 1)[0])});
  } catch {
    engine = createSearchEngine(null);
    self.postMessage({type: 'unavailable'});
  }
}
const loaded = load();
self.addEventListener('message', async ({data}) => {
  await loaded;
  if (data.type === 'search') {
    try { self.postMessage({type: 'result', id: data.id, ...engine(data.query)}); }
    catch { self.postMessage({type: 'result', id: data.id, ...createSearchEngine(null)(data.query), limited: true}); }
  }
});
