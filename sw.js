/* Generado por npm run build. Cada versión conserva juntos app y diccionario. */
const VERSION = '10b0d463d66e';
const PREFIX = `click300-${encodeURIComponent(self.registration.scope)}-`;
const CACHE = PREFIX + VERSION;
const PRECACHE = ["./","./index.html","./styles.css","./assets/app.js","./assets/worker.js","./data/es.aff","./data/es.dic","./data/metadata.json","./icon.svg","./icon-192.png","./icon-512.png","./manifest.webmanifest","./THIRD_PARTY_NOTICES.md","./licenses/dictionary-es.txt","./licenses/MPL-1.1.txt","./licenses/nspell.txt","./licenses/is-buffer.txt"];
const base = new URL('./', self.location.href);
const localAssets = new Set(PRECACHE.map(path => new URL(path, base).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE.map(path => new Request(new URL(path,base),{cache:'reload'})))));
  // No se activa sobre una pestaña vieja: evita mezclar versiones.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const {request} = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(new URL('./index.html',base));
      return cached ?? fetch(request);
    })());
  } else {
    url.search = '';
    if (!localAssets.has(url.href)) return;
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(url.href)) ?? fetch(request);
    })());
  }
});
