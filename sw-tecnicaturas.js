// Service Worker de Trayectorias / Secretaría InSET Caleta Olivia
// Estrategia: SIEMPRE priorizar la red (datos frescos de Supabase, notas, etc).
// El caché solo se usa como respaldo si no hay conexión.

const CACHE_NAME = 'inset-tecnicaturas-v1'; // subir el número cada vez que se suba una actualización importante
const PRECACHE_URLS = [
  '/tecnicaturas.html',
  '/manifest-tecnicaturas.json',
  '/Icons-tecnicaturas/icon-192.png',
  '/Icons-tecnicaturas/icon-512.png'
];

// Instalación: precachea el shell básico
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting(); // activa la versión nueva apenas se instala
});

// Activación: borra cachés viejos de versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first. Si falla la red, recurre al caché (modo offline básico).
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo interceptamos GET del propio dominio (HTML/CSS/JS/íconos).
  // Todo lo demás (Supabase, Formspree, POST, etc.) va directo a la red sin tocar el caché.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((response) => {
        // Actualiza el caché con la versión fresca
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return response;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('/tecnicaturas.html')))
  );
});
