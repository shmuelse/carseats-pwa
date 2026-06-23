(() => {
  'use strict';

  const INSTALL_CONTAINER_ID = 'installBanner';
  const INSTALL_BUTTON_TEXT = 'התקן כאפליקציה';

  let deferredInstallPrompt = null;

  function getInstallContainer() {
    return document.getElementById(INSTALL_CONTAINER_ID);
  }

  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  function clearInstallPrompt() {
    const container = getInstallContainer();

    if (container) {
      container.replaceChildren();
    }
  }

  function renderInstallPrompt() {
    const container = getInstallContainer();

    if (!container || !deferredInstallPrompt || isStandalone()) {
      clearInstallPrompt();
      return;
    }

    const installButton = document.createElement('button');
    installButton.className = 'primary';
    installButton.type = 'button';
    installButton.textContent = INSTALL_BUTTON_TEXT;

    installButton.addEventListener('click', async () => {
      if (!deferredInstallPrompt) {
        return;
      }

      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      clearInstallPrompt();
    });

    container.replaceChildren(installButton);
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    renderInstallPrompt();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    clearInstallPrompt();
  });

  if (isStandalone()) {
    clearInstallPrompt();
  }
})();
