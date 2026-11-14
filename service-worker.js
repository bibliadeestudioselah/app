const CACHE_VERSION = 'selah-v5.0.0';
const APP_SHELL = [
  './', './index.html', './manifest.json',
  './css/base.css', './css/themes.css', './css/layout.css', './css/components.css',
  './js/minisearch.min.js', './js/db.js', './js/theme.js', './js/router.js',
  './js/bible.js', './js/search.js', './js/assistant.js', './js/library.js',
  './js/plans.js', './js/audio.js', './js/app.js',
  './data/RVR1960.json', './data/library.json', './data/plans.json', './data/announcement.json',
  './data/audio-map.json',
  './icons/icon-192.png', './icons/icon-512.png'
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

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok && request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// Sincronización en segundo plano (4:00 PM)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-check') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  console.log('🔄 Buscando actualizaciones en segundo plano...');
  try {
    // En un caso real, aquí consultarías un archivo version.json en tu GitHub
    // Si la versión es diferente, forzarías la actualización del caché.
    const response = await fetch('./index.html', { cache: 'no-store' });
    if (response.ok) {
      console.log('✅ App revisada. Todo al día.');
    }
  } catch (error) {
    console.log('❌ Sin conexión. Se reintentará cuando haya red.');
  }
}