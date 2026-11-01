const CACHE_NAME = 'sita-calendar-v1.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// Установка Service Worker и кэширование ресурсов
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Принудительно активируем новую версию
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Активация и удаление старого кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов (Stale-While-Revalidate: сначала сеть для обновления)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});