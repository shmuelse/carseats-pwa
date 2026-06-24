(() => {
  'use strict';

  const LANGUAGE_KEY = 'carseats-language';
  const DEFAULT_LANGUAGE = 'he';

  const LANGUAGES = {
    he: {
      label: 'עברית',
      dir: 'rtl',
      htmlLang: 'he',
    },
    en: {
      label: 'English',
      dir: 'ltr',
      htmlLang: 'en',
    },
  };

  const TRANSLATIONS = {
    en: {
      'בחירת רכב': 'Vehicle selection',
      '← בחירת רכב': '← Vehicle selection',
      'איזה רכב נוסע היום?': 'Which car is driving today?',
      'לכל רכב נשמרת תורנות נפרדת.': 'Each vehicle has its own separate rotation.',
      '🚙 רכב משפחתי — 7 מקומות': '🚙 Family car — 7 seats',
      'מושב קדמי, שלושה באמצע ושניים מאחור.': 'Front passenger seat, three middle seats, and two rear seats.',
      '🚗 רכב רגיל — 5 מקומות': '🚗 Regular car — 5 seats',
      'נהג, ילד בתור במושב הקדמי ושלושה ילדים מאחור.': 'Driver, one child in the front rotation, and three children in the back.',

      'מושבים ברכב': 'Car seats',
      '🚗 מושבים': '🚗 Seats',
      'סידור הוגן למשפחה': 'Fair seating for the family',
      '🚘 נסיעה': '🚘 Trip',
      '📋 תורים': '📋 Queues',
      '🛣️ היסטוריה': '🛣️ History',
      '⚙️ הגדרות': '⚙️ Settings',
      'סוג נסיעה': 'Trip type',
      '⚡ קצרה': '⚡ Short',
      '🛣️ ארוכה': '🛣️ Long',
      'מי מההורים נוסע?': 'Which parent is coming?',
      'מושב קדמי לילד זמין רק כאשר נבחר הורה אחד בדיוק.': 'A front seat for a child is available only when exactly one parent is selected.',
      'מי מהילדים נוסע?': 'Which children are coming?',
      'צור סידור מושבים': 'Create seating plan',
      'קדמי': 'Front',
      'אמצע': 'Middle',
      'אחורי': 'Back',
      'נהג': 'Driver',
      'חזור לעריכה': 'Back to edit',
      'שמור נסיעה': 'Save trip',
      'תור לכיסא הקדמי': 'Front seat queue',
      'תור לשורה האחורית': 'Back row queue',
      'קצרות': 'Short trips',
      'ארוכות': 'Long trips',
      'נסיעות אחרונות': 'Recent trips',
      'תצוגה': 'Display',
      'שפה': 'Language',
      'שמות הורים': 'Parent names',
      'הורה 1': 'Parent 1',
      'הורה 2': 'Parent 2',
      'ילדים': 'Children',
      'שם ילד/ה': 'Child name',
      'מגדר': 'Gender',
      '👦 בן': '👦 Boy',
      '👧 בת': '👧 Girl',
      'הוסף ילד/ה': 'Add child',
      'גיבוי ותחזוקה': 'Backup and maintenance',
      'ייצוא גיבוי': 'Export backup',
      'ייבוא גיבוי': 'Import backup',
      'נקה היסטוריה': 'Clear history',
      'הנתונים נשמרים במכשיר בלבד. מומלץ לייצא גיבוי מדי פעם.': 'Data is saved on this device only. It is recommended to export a backup from time to time.',
      'בחר ילד/ה': 'Choose child',
      'הסר מהמושב': 'Remove from seat',
      'ביטול': 'Cancel',
      'מושב קבוע': 'Fixed seat',
      'הסר מושב קבוע': 'Remove fixed seat',
      '🌙 מצב כהה': '🌙 Dark mode',
      '☀️ מצב רגיל': '☀️ Light mode',
      'עברית': 'Hebrew',
      'English': 'English',

      'רכב 5 מקומות': '5-seat car',
      '🚗 רכב 5 מקומות': '🚗 5-seat car',
      'תור נפרד למושב הקדמי': 'Separate front-seat rotation',
      'כמה הורים נוסעים?': 'How many parents are coming?',
      '👤 הורה אחד': '👤 One parent',
      '👥 שני הורים': '👥 Two parents',
      'עם הורה אחד יש מקום לעד ארבעה ילדים, ואחד מהם יושב מקדימה.': 'With one parent, there is room for up to four children, and one sits in the front.',
      'התור למושב הקדמי': 'Front seat queue',
      'מקומות קבועים ברכב 5 מקומות': 'Fixed seats in the 5-seat car',
      'ההגדרות כאן נפרדות מהמקומות הקבועים ברכב 7 מקומות. אם נוסעים שני הורים, מושב קדמי קבוע לילד לא יהיה זמין.': 'These settings are separate from the fixed seats in the 7-seat car. If two parents are coming, a fixed front seat for a child will not be available.',

      'התקן כאפליקציה': 'Install as app',
      'האפליקציה מוכנה להתקנה על מסך הבית.': 'The app is ready to be installed on your home screen.',
      'ההתקנה הסתיימה בהצלחה.': 'Installation completed successfully.',
      'סידור המושבים מוכן. אפשר ללחוץ על מושב ולערוך ידנית.': 'The seating plan is ready. You can tap a seat and edit it manually.',
      'אין עדיין ילדים. הוסף ילדים בהגדרות.': 'No children yet. Add children in settings.',
      'אין עדיין נסיעות.': 'No trips yet.',
      'אין נתונים להצגה.': 'No data to show.',
      'לא נקבע': 'Not set',
      'פנוי': 'Empty',
      'מקום פנוי': 'Empty seat',
      'ילד/ה שנמחק/ה': 'Deleted child',
      'אבא': 'Dad',
      'אמא': 'Mom',
      'הורה': 'Parent',
      'נסיעות': 'trips',
      'נסיעה': 'trip',
      'פעמים': 'times',
      'פעם': 'time',
      'היום': 'today',
    },
  };

  const TEXT_RULES = [
    {
      pattern: /^(\d+) נסיעות$/,
      replace: '$1 trips',
    },
    {
      pattern: /^נבחרו (\d+) ילדים, אך יש רק (\d+) מושבים זמינים בהרכב הזה\.$/,
      replace: '$1 children were selected, but only $2 seats are available for this setup.',
    },
    {
      pattern: /^הורה (\d+)$/,
      replace: 'Parent $1',
    },
    {
      pattern: /^מושב קבוע: (.+)$/,
      replace: 'Fixed seat: $1',
    },
    {
      pattern: /^הסר מושב קבוע עבור (.+)$/,
      replace: 'Remove fixed seat for $1',
    },
    {
      pattern: /^בחר מושב קבוע עבור (.+)$/,
      replace: 'Choose a fixed seat for $1',
    },
  ];

  function getStoredLanguage() {
    const storedLanguage = localStorage.getItem(LANGUAGE_KEY);
    return LANGUAGES[storedLanguage] ? storedLanguage : DEFAULT_LANGUAGE;
  }

  function translateText(text, language = getStoredLanguage()) {
    if (language === DEFAULT_LANGUAGE) {
      return text;
    }

    const normalizedText = String(text).replace(/\s+/g, ' ').trim();

    if (!normalizedText) {
      return text;
    }

    const exactTranslation = TRANSLATIONS[language]?.[normalizedText];

    if (exactTranslation) {
      return exactTranslation;
    }

    for (const rule of TEXT_RULES) {
      if (rule.pattern.test(normalizedText)) {
        return normalizedText.replace(rule.pattern, rule.replace);
      }
    }

    return text;
  }

  function applyLanguage(language = getStoredLanguage()) {
    const safeLanguage = LANGUAGES[language] ? language : DEFAULT_LANGUAGE;
    const languageConfig = LANGUAGES[safeLanguage];

    document.documentElement.lang = languageConfig.htmlLang;
    document.documentElement.dir = languageConfig.dir;
    document.documentElement.dataset.language = safeLanguage;

    translateDocument();
    renderLanguageSettings();
  }

  function saveLanguage(language) {
    const safeLanguage = LANGUAGES[language] ? language : DEFAULT_LANGUAGE;
    localStorage.setItem(LANGUAGE_KEY, safeLanguage);
    window.location.reload();
  }

  function translateNodeText(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const originalText = node.nodeValue;
    const translatedText = translateText(originalText);

    if (translatedText !== originalText) {
      node.nodeValue = originalText.replace(originalText.trim(), translatedText);
    }
  }

  function translateElementAttributes(element) {
    ['title', 'aria-label', 'placeholder'].forEach((attribute) => {
      const value = element.getAttribute(attribute);

      if (!value) {
        return;
      }

      const translatedValue = translateText(value);

      if (translatedValue !== value) {
        element.setAttribute(attribute, translatedValue);
      }
    });
  }

  function translateTree(root) {
    if (getStoredLanguage() === DEFAULT_LANGUAGE) {
      return;
    }

    if (root.nodeType === Node.TEXT_NODE) {
      translateNodeText(root);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) {
      return;
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;

          if (!parent || ['SCRIPT', 'STYLE'].includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          if (!node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const textNodes = [];
    let currentNode = walker.nextNode();

    while (currentNode) {
      textNodes.push(currentNode);
      currentNode = walker.nextNode();
    }

    textNodes.forEach(translateNodeText);

    if (root.querySelectorAll) {
      root.querySelectorAll('[title], [aria-label], [placeholder]').forEach(
        translateElementAttributes,
      );
    }
  }

  function translateDocument() {
    translateTree(document.body || document.documentElement);

    if (document.title) {
      document.title = translateText(document.title);
    }
  }

  function renderLanguageSettings() {
    const container = document.getElementById('languageSettings');

    if (!container) {
      return;
    }

    const activeLanguage = getStoredLanguage();
    const options = document.createElement('div');
    options.className = 'theme-options';

    Object.entries(LANGUAGES).forEach(([language, config]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.textContent = config.label;
      button.classList.toggle('selected', language === activeLanguage);
      button.addEventListener('click', () => saveLanguage(language));
      options.append(button);
    });

    container.replaceChildren(options);
    translateTree(container);
  }

  function watchDynamicText() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(translateTree);

        if (mutation.type === 'characterData') {
          translateNodeText(mutation.target);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  window.CARSEATS_I18N = {
    getLanguage: getStoredLanguage,
    setLanguage: saveLanguage,
    t: translateText,
    apply: applyLanguage,
  };

  document.documentElement.lang = LANGUAGES[getStoredLanguage()].htmlLang;
  document.documentElement.dir = LANGUAGES[getStoredLanguage()].dir;
  document.documentElement.dataset.language = getStoredLanguage();

  window.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
    watchDynamicText();
  });
})();
