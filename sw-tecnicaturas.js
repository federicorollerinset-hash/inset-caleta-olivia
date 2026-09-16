// Service Worker de Trayectorias / Secretaría InSET Caleta Olivia
//
// v2: se fuerza { cache: 'no-store' } en el fetch para que la app siempre
// pida la versión real al servidor (sin que el caché HTTP del navegador
// intercepte la petición), y se activa la versión nueva apenas está lista
// (skipWaiting + clients.claim), para no tener que desinstalar la app cada
// vez que se sube una actualización.

const CACHE_NAME = 'inset-tecnicaturas-v2';
const PRECACHE_URLS = [
  '/tecnicaturas.html',
  '/manifest-tecnicaturas.json',
  '/Icons%20tecnicatrura/icon-192.png',
  '/Icons%20tecnicatrura/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    fetch(req, { cache: 'no-store' }) // bypass del caché HTTP del navegador: siempre pide la red real
      .then((response) => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return response;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('/tecnicaturas.html')))
  );
});
