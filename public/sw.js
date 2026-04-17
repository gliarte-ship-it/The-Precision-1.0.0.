const CACHE_NAME = 'precision-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip Next.js internal and data requests
  if (
    event.request.url.includes('/_next/') || 
    event.request.headers.get('Purpose') === 'prefetch' ||
    event.request.headers.get('Next-Router-State-Tree') ||
    event.request.headers.get('Next-Router-Prefetch')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
