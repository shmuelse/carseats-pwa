(() => {
  'use strict';

  const INSTALL_SENT_KEY = 'carseats-install-event-sent';
  const APP_VERSION = '2026-06-theme-analytics';

  function getConfig() {
    return window.CARSEATS_SUPABASE_CONFIG || {};
  }

  function isConfigured() {
    const config = getConfig();
    return Boolean(config.enabled && config.url && config.anonKey);
  }

  function getDisplayMode() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone';
    }

    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen';
    }

    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui';
    }

    return 'browser';
  }

  function getPlatform() {
    const userAgent = navigator.userAgent || '';

    if (/Android/i.test(userAgent)) {
      return 'android';
    }

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return 'ios';
    }

    if (/Windows/i.test(userAgent)) {
      return 'windows';
    }

    if (/Macintosh|Mac OS/i.test(userAgent)) {
      return 'macos';
    }

    return 'other';
  }

  async function sendInstallEvent() {
    if (!isConfigured()) {
      return;
    }

    if (localStorage.getItem(INSTALL_SENT_KEY) === 'true') {
      return;
    }

    const config = getConfig();
    const baseUrl = config.url.replace(/\/$/, '');

    try {
      const response = await fetch(`${baseUrl}/rest/v1/install_events`, {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          event_name: 'pwa_install',
          app_version: APP_VERSION,
          platform: getPlatform(),
          display_mode: getDisplayMode(),
        }),
      });

      if (response.ok) {
        localStorage.setItem(INSTALL_SENT_KEY, 'true');
      }
    } catch (error) {
      console.warn('Install analytics event was not sent', error);
    }
  }

  window.addEventListener('appinstalled', sendInstallEvent);
})();
