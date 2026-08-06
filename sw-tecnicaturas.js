// Service Worker de Trayectorias / Secretaría InSET Caleta Olivia
const CACHE_NAME = 'inset-tecnicaturas-v1';
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
    fetch(req)
      .then((response) => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return response;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('/tecnicaturas.html')))
  );
});
