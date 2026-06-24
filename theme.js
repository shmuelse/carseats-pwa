(() => {
  'use strict';

  const THEME_KEY = 'carseats-theme';
  const DEFAULT_THEME = 'dark';
  const THEMES = {
    dark: {
      label: '🌙 מצב כהה',
      color: '#07070f',
    },
    light: {
      label: '☀️ מצב רגיל',
      color: '#f5f6fb',
    },
  };

  function getStoredTheme() {
    const storedTheme = localStorage.getItem(THEME_KEY);
    return THEMES[storedTheme] ? storedTheme : DEFAULT_THEME;
  }

  function applyTheme(theme) {
    const safeTheme = THEMES[theme] ? theme : DEFAULT_THEME;
    document.documentElement.dataset.theme = safeTheme;

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', THEMES[safeTheme].color);
    }
  }

  function saveTheme(theme) {
    const safeTheme = THEMES[theme] ? theme : DEFAULT_THEME;
    localStorage.setItem(THEME_KEY, safeTheme);
    applyTheme(safeTheme);
    renderThemeSettings();
  }

  function renderThemeSettings() {
    const container = document.getElementById('themeSettings');

    if (!container) {
      return;
    }

    const activeTheme = getStoredTheme();
    const options = document.createElement('div');
    options.className = 'theme-options';

    Object.entries(THEMES).forEach(([theme, config]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.textContent = config.label;
      button.classList.toggle('selected', theme === activeTheme);
      button.addEventListener('click', () => saveTheme(theme));
      options.append(button);
    });

    container.replaceChildren(options);
  }

  applyTheme(getStoredTheme());
  window.addEventListener('DOMContentLoaded', renderThemeSettings);
})();
