import {normalize, validateQuery} from './search.js';

const DATABASE = 'CLIC300DB';
const NOTEBOOK_KEY = 'CLIC300-notebook';
const MIGRATION = 'notebook-name-migration-v1';
// Reconoce las grafías previas del identificador sin usarlas como nombre actual.
const canonicalName = name => name.toUpperCase().replace('K300', '300');

function openDatabase(name, create = false) {
  return new Promise((resolve,reject) => {
    let expired = false;
    const timer = setTimeout(() => {expired = true;reject(new Error('El almacenamiento no responde'));},2500);
    const request = create ? indexedDB.open(name,2) : indexedDB.open(name);
    request.onupgradeneeded = () => {
      if (!create) {request.transaction.abort();return;}
      for (const [store,keyPath] of [['notebook','word'],['settings','key']]) {
        if (!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store,{keyPath});
      }
    };
    request.onsuccess = () => {
      clearTimeout(timer);
      if (expired) {request.result.close();return;}
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => {clearTimeout(timer);reject(request.error);};
    request.onblocked = () => {expired = true;clearTimeout(timer);reject(new Error('Base bloqueada'));};
  });
}

function parseWords(text) {
  try {return sanitizeWords(JSON.parse(text ?? '[]'));} catch {return [];}
}

function localNotebookRows() {
  try {
    const rows = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key && canonicalName(key) === 'CLIC300-NOTEBOOK') rows.push(...parseWords(localStorage.getItem(key)));
    }
    return rows;
  } catch {return [];}
}

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
      this.db = await openDatabase(DATABASE,true);
      this.mode = 'indexeddb';
      try {await this.migrate();} catch {this.migrationPending = true;}
      return;
    } catch { /* Los datos anteriores no se borran. */ }
    try {
      localStorage.setItem('CLIC300-storage-test', '1');
      localStorage.removeItem('CLIC300-storage-test');
      this.memory = parseWords(localStorage.getItem(NOTEBOOK_KEY));
      if (!localStorage.getItem('CLIC300-notebook-migrated')) {
        this.memory = sanitizeWords([...this.memory,...localNotebookRows()]);
        localStorage.setItem(NOTEBOOK_KEY,JSON.stringify(this.memory));
        localStorage.setItem('CLIC300-notebook-migrated','1');
      }
      this.mode = 'localstorage';
    } catch { this.mode = 'memory'; }
  }

  async migrate() {
    if (await this.transaction('readonly',store => store.get(MIGRATION),'settings')) return;
    const previous = localNotebookRows();
    if (typeof indexedDB.databases === 'function') {
      for (const item of await indexedDB.databases()) {
        if (!item.name || item.name === DATABASE || canonicalName(item.name) !== DATABASE) continue;
        const db = await openDatabase(item.name);
        try {
          if (!db.objectStoreNames.contains('notebook')) continue;
          const rows = await new Promise((resolve,reject) => {
            const tx = db.transaction('notebook','readonly');
            const request = tx.objectStore('notebook').getAll();
            tx.oncomplete = () => resolve(request.result);
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
          });
          previous.push(...sanitizeWords(rows));
        } finally {db.close();}
      }
    }
    const current = await this.transaction('readonly',store => store.getAll());
    const merged = sanitizeWords([...current,...previous]);
    await new Promise((resolve,reject) => {
      const tx = this.db.transaction(['notebook','settings'],'readwrite');
      for (const item of merged) tx.objectStore('notebook').put(item);
      // El marcador y las palabras se guardan juntos: no reaparecen al quitarlas.
      tx.objectStore('settings').put({key:MIGRATION,complete:true});
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async all() {
    await this.ready;
    if (this.mode !== 'indexeddb') return [...this.memory];
    return sanitizeWords(await this.transaction('readonly', store => store.getAll()));
  }

  transaction(mode, operation, storeName = 'notebook') {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, mode);
      const request = operation(tx.objectStore(storeName));
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
      if (this.mode === 'localstorage') localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(next));
      this.memory = next;
    }
    return !exists;
  }
}
