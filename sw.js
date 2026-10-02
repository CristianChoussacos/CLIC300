/* Generado por npm run build. Cada versión conserva juntos app y diccionario. */
const VERSION = '40679edca4e5';
const PREFIX = `CLIC300-${encodeURIComponent(self.registration.scope)}-`;
const CACHE = PREFIX + VERSION;
const PRECACHE = ["./","./index.html","./styles.css","./assets/app.js","./assets/worker.js","./data/es.aff","./data/es.dic","./data/metadata.json","./icon.svg","./icon-192.png","./icon-512.png","./manifest.webmanifest","./THIRD_PARTY_NOTICES.md","./licenses/dictionary-es.txt","./licenses/MPL-1.1.txt","./licenses/nspell.txt","./licenses/is-buffer.txt","./data/definitions/metadata.json","./licenses/CC-BY-SA-4.0.txt","./data/definitions/definitions-00.json","./data/definitions/definitions-01.json","./data/definitions/definitions-02.json","./data/definitions/definitions-03.json","./data/definitions/definitions-04.json","./data/definitions/definitions-05.json","./data/definitions/definitions-06.json","./data/definitions/definitions-07.json","./data/definitions/definitions-08.json","./data/definitions/definitions-09.json","./data/definitions/definitions-0a.json","./data/definitions/definitions-0b.json","./data/definitions/definitions-0c.json","./data/definitions/definitions-0d.json","./data/definitions/definitions-0e.json","./data/definitions/definitions-0f.json","./data/definitions/definitions-10.json","./data/definitions/definitions-11.json","./data/definitions/definitions-12.json","./data/definitions/definitions-13.json","./data/definitions/definitions-14.json","./data/definitions/definitions-15.json","./data/definitions/definitions-16.json","./data/definitions/definitions-17.json","./data/definitions/definitions-18.json","./data/definitions/definitions-19.json","./data/definitions/definitions-1a.json","./data/definitions/definitions-1b.json","./data/definitions/definitions-1c.json","./data/definitions/definitions-1d.json","./data/definitions/definitions-1e.json","./data/definitions/definitions-1f.json","./data/definitions/definitions-20.json","./data/definitions/definitions-21.json","./data/definitions/definitions-22.json","./data/definitions/definitions-23.json","./data/definitions/definitions-24.json","./data/definitions/definitions-25.json","./data/definitions/definitions-26.json","./data/definitions/definitions-27.json","./data/definitions/definitions-28.json","./data/definitions/definitions-29.json","./data/definitions/definitions-2a.json","./data/definitions/definitions-2b.json","./data/definitions/definitions-2c.json","./data/definitions/definitions-2d.json","./data/definitions/definitions-2e.json","./data/definitions/definitions-2f.json","./data/definitions/definitions-30.json","./data/definitions/definitions-31.json","./data/definitions/definitions-32.json","./data/definitions/definitions-33.json","./data/definitions/definitions-34.json","./data/definitions/definitions-35.json","./data/definitions/definitions-36.json","./data/definitions/definitions-37.json","./data/definitions/definitions-38.json","./data/definitions/definitions-39.json","./data/definitions/definitions-3a.json","./data/definitions/definitions-3b.json","./data/definitions/definitions-3c.json","./data/definitions/definitions-3d.json","./data/definitions/definitions-3e.json","./data/definitions/definitions-3f.json"];
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
  if (request.mode === 'navigate' && (url.pathname === base.pathname || url.pathname === new URL('./index.html',base).pathname)) {
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
