import {normalize, validateQuery} from './search.js';

export function sanitizeWords(records) {
  if (!Array.isArray(records)) return [];
  const seen = new Set();
  return records.slice(0, 500).filter(item => {
    if (!item || typeof item.word !== 'string') return false;
    const {query, error} = validateQuery(item.word);
    if (!query || error || seen.has(query)) return false;
    seen.add(query);
    return true;
  }).map(item => ({word: item.word.normalize('NFC').trim(), savedAt: Number.isFinite(item.savedAt) ? item.savedAt : 0}));
}

export class NotebookStore {
  constructor() {
    this.memory = [];
    this.mode = 'memory';
    this.ready = this.open();
  }

  async open() {
    try {
      this.db = await new Promise((resolve, reject) => {
        let expired = false;
        const timer = setTimeout(() => { expired = true; reject(new Error('El almacenamiento no responde')); }, 2500);
        const request = indexedDB.open('Click300DB', 1);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains('notebook')) request.result.createObjectStore('notebook', {keyPath:'word'});
        };
        request.onsuccess = () => {
          clearTimeout(timer);
          if (expired) { request.result.close(); return; }
          request.result.onversionchange = () => request.result.close();
          resolve(request.result);
        };
        request.onerror = () => { clearTimeout(timer); reject(request.error); };
        request.onblocked = () => { expired = true; clearTimeout(timer); reject(new Error('Base bloqueada')); };
      });
      this.mode = 'indexeddb';
      return;
    } catch { /* Los datos anteriores no se borran. */ }
    try {
      localStorage.setItem('click300-storage-test', '1');
      localStorage.removeItem('click300-storage-test');
      this.memory = sanitizeWords(JSON.parse(localStorage.getItem('click300-notebook') ?? '[]'));
      this.mode = 'localstorage';
    } catch { this.mode = 'memory'; }
  }

  async all() {
    await this.ready;
    if (this.mode !== 'indexeddb') return [...this.memory];
    return sanitizeWords(await this.transaction('readonly', store => store.getAll()));
  }

  transaction(mode, operation) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('notebook', mode);
      const request = operation(tx.objectStore('notebook'));
      let result;
      request.onsuccess = () => { result = request.result; };
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error ?? new Error('No se pudo guardar'));
      tx.onabort = () => reject(tx.error ?? new Error('No se pudo guardar'));
    });
  }

  async toggle(word) {
    await this.ready;
    const {query, error} = validateQuery(word);
    if (!query || error) throw new Error('Palabra no válida');
    const all = await this.all();
    const exists = all.some(item => normalize(item.word) === query);
    if (!exists && all.length >= 500) throw new Error('Tu cuaderno está lleno. Quitá alguna palabra para guardar otra.');
    if (this.mode === 'indexeddb') {
      await this.transaction('readwrite', store => exists ? store.delete(all.find(item => normalize(item.word) === query).word) : store.put({word, savedAt: Date.now()}));
    } else {
      const next = exists ? all.filter(item => normalize(item.word) !== query) : [...all, {word, savedAt:Date.now()}];
      if (this.mode === 'localstorage') localStorage.setItem('click300-notebook', JSON.stringify(next));
      this.memory = next;
    }
    return !exists;
  }
}
