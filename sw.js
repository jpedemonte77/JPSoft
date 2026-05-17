const CACHE_NAME = 'jpsoft-dietetica-v1';
const ASSETS = [
  '/JPSoft/gestor.html',
  '/JPSoft/manifest.json',
  '/JPSoft/icon-192.png',
  '/JPSoft/icon-512.png'
];

// Instalación — cachear recursos base
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activación — limpiar caches viejas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== CACHE_NAME)
        .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', e => {
  // Solo interceptar requests del mismo origen
  if (!e.request.url.startsWith(self.location.origin)) return;
  // Firebase y Google Fonts siempre desde la red
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic')) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Si la respuesta es válida, actualizamos la caché
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
