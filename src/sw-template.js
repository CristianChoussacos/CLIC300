/* Generado por npm run build. Cada versión conserva juntos app y diccionario. */
const VERSION = '__VERSION__';
const PREFIX = `CLIC300-${encodeURIComponent(self.registration.scope)}-`;
const CACHE = PREFIX + VERSION;
const PRECACHE = __PRECACHE__;
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
