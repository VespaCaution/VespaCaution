const CACHE_NAME = 'alvearcheck-v1';
const ASSETS = [
  './',
  './index.html',
  './icon.png',
  './logo.png'
];

// Installation : on met en cache les fichiers de base
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : on nettoie les vieux caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Stratégie : Network first, fallback to cache
self.addEventListener('fetch', (e) => {
  // On ne met pas en cache les appels API (Supabase, Groq)
  if (e.request.url.includes('supabase.co') || e.request.url.includes('groq.com')) return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // On met en cache la nouvelle version
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
