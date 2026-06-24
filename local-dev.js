(() => {
  'use strict';

  const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(
    window.location.hostname,
  );

  if (!isLocalhost || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();

    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );

    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
  });
})();
