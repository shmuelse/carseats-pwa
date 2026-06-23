const CACHE_NAME = 'carseats-v7';
const BASE_PATH = '/carseats-pwa/';

const APP_SHELL = [
  BASE_PATH,
  `${BASE_PATH}home.html`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}five-seat.html`,
  `${BASE_PATH}styles.css`,
  `${BASE_PATH}app.js`,
  `${BASE_PATH}five-seat.js`,
  `${BASE_PATH}vehicle-router.js`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}icons/car-seats-icon.svg`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`,
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
    return caches.match(`${BASE_PATH}home.html`);
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
