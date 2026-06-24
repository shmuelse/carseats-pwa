const CACHE_NAME = 'carseats-v11';

const APP_SHELL = [
  './',
  './home.html',
  './index.html',
  './five-seat.html',
  './styles.css',
  './app.js',
  './five-seat.js',
  './theme.js',
  './i18n.js',
  './vehicle-router.js',
  './pwa-install.js',
  './supabase-config.js',
  './install-analytics.js',
  './manifest.json',
  './icons/car-seats-icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  event.respondWith(handleAssetRequest(request));
});

async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);

    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match('./home.html');
  }
}

async function handleAssetRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);
  const requestUrl = new URL(request.url);

  if (response.ok && requestUrl.origin === self.location.origin) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }

  return response;
}
