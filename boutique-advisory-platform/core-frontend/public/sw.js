// sw-version: 2026-07-15b — bump this string on deploys to force browsers to
// re-fetch this script, install the self-destruct worker, and clear any stale
// caches from a previously-registered service worker.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(clients.map((client) => client.navigate(client.url)));
  })());
});

self.addEventListener('fetch', () => {
  // PWA/service-worker support is intentionally disabled.
});
