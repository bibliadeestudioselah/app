const CACHE_VERSION = 'selah-v6.0.0';
const APP_SHELL = [
  './', './index.html', './manifest.json',
  './css/base.css', './css/themes.css', './css/layout.css', './css/components.css',
  './js/minisearch.min.js', './js/db.js', './js/theme.js', './js/router.js',
  './js/bible.js', './js/search.js', './js/assistant.js', './js/library.js',
  './js/plans.js', './js/audio.js', './js/app.js',
  './data/RVR1960.json', './data/library.json', './data/plans.json', './data/announcement.json',
  './data/audio-map.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-192.png', './icons/maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Estrategia: Stale-While-Revalidate (Carga rápido desde caché y actualiza en silencio)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok && request.url.startsWith(self.location.origin)) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => null);

      // Devuelve lo que está en caché inmediatamente (sin esperar a internet)
      // Si no hay caché, espera la respuesta de internet.
      return cachedResponse || fetchPromise || caches.match('./index.html');
    })
  );
});

// Mantenemos la sincronización de fondo para cuando la app esté cerrada
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-check') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  try {
    await fetch('./data/announcement.json', { cache: 'no-store' });
  } catch (error) {
    // Silencioso, se reintentará luego
  }
}