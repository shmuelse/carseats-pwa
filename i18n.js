(() => {
  'use strict';

  const LANGUAGE_KEY = 'carseats-language';
  const DEFAULT_LANGUAGE = 'he';

  const nativeAlert = window.alert.bind(window);
  const nativeConfirm = window.confirm.bind(window);

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
      'רכב 5 מקומות': '5-seat car',
      '🚗 רכב 5 מקומות': '🚗 5-seat car',
      'תור נפרד למושב הקדמי': 'Separate front-seat rotation',
      'כמה הורים נוסעים?': 'How many parents are coming?',
      '👤 הורה אחד': '👤 One parent',
      '👥 שני הורים': '👥 Two parents',
      'עם הורה אחד יש מקום לעד ארבעה ילדים, ואחד מהם יושב מקדימה.': 'With one parent, there is room for up to four children, and one sits in the front.',
      'התור למושב הקדמי': 'Front seat queue',
      'מקומות קבועים ברכב 5 מקומות': 'Fixed seats in the 5-seat car',
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
      'יש לבחור לפחות ילד/ה אחד/ת.': 'Select at least one child.',
      'השמירה נכשלה. מומלץ לייצא גיבוי ולבדוק מקום פנוי בדפדפן.': 'Saving failed. Export a backup and check browser storage space.',
      'הנתונים המקומיים נפגמו ולא נטענו. אפשר לייבא גיבוי מההגדרות.': 'Local data was damaged and could not be loaded. You can import a backup from Settings.',
      'עם שני הורים אפשר לבחור עד שלושה ילדים.': 'With two parents, you can select up to three children.',
      'עם הורה אחד אפשר לבחור עד ארבעה ילדים.': 'With one parent, you can select up to four children.',
      'עם שני הורים, מושב קדמי קבוע לילד לא זמין.': 'With two parents, a fixed front seat for a child is not available.',
    },
  };

  const TEXT_RULES = [
    { pattern: /^(\d+) נסיעות$/, replace: '$1 trips' },
    { pattern: /^נבחרו (\d+) ילדים, אך יש רק (\d+) מושבים זמינים בהרכב הזה\.$/, replace: '$1 children were selected, but only $2 seats are available for this setup.' },
    { pattern: /^נבחרו (\d+) ילדים, אך ברכב 5 מקומות עם שני הורים אפשר לבחור עד (\d+) ילדים\.$/, replace: '$1 children were selected, but in a 5-seat car with two parents you can select up to $2 children.' },
    { pattern: /^נבחרו (\d+) ילדים, אך ברכב 5 מקומות עם הורה אחד אפשר לבחור עד (\d+) ילדים\.$/, replace: '$1 children were selected, but in a 5-seat car with one parent you can select up to $2 children.' },
    { pattern: /^הורה (\d+)$/, replace: 'Parent $1' },
    { pattern: /^מושב קבוע: (.+)$/, replace: 'Fixed seat: $1' },
    { pattern: /^הסר מושב קבוע עבור (.+)$/, replace: 'Remove fixed seat for $1' },
    { pattern: /^בחר מושב קבוע עבור (.+)$/, replace: 'Choose a fixed seat for $1' },
    { pattern: /^המושב (.+) מוגדר גם ל(.+) וגם ל(.+)\.$/, replace: 'The seat $1 is assigned to both $2 and $3.' },
  ];

  const originalTextByNode = new WeakMap();
  const originalAttributesByElement = new WeakMap();
  let isTranslating = false;

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

    translateDocument(safeLanguage);
    renderLanguageSettings();
  }

  function saveLanguage(language) {
    const safeLanguage = LANGUAGES[language] ? language : DEFAULT_LANGUAGE;
    localStorage.setItem(LANGUAGE_KEY, safeLanguage);
    applyLanguage(safeLanguage);
  }

  function getOriginalText(node) {
    if (!originalTextByNode.has(node)) {
      originalTextByNode.set(node, node.nodeValue);
    }

    return originalTextByNode.get(node);
  }

  function translateNodeText(node, language = getStoredLanguage()) {
    if (!node || node.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const originalText = getOriginalText(node);

    if (!originalText.trim()) {
      return;
    }

    if (language === DEFAULT_LANGUAGE) {
      node.nodeValue = originalText;
      return;
    }

    const translatedText = translateText(originalText, language);
    node.nodeValue = originalText.replace(originalText.trim(), translatedText);
  }

  function getOriginalAttribute(element, attribute) {
    if (!originalAttributesByElement.has(element)) {
      originalAttributesByElement.set(element, {});
    }

    const attributes = originalAttributesByElement.get(element);

    if (!Object.prototype.hasOwnProperty.call(attributes, attribute)) {
      attributes[attribute] = element.getAttribute(attribute);
    }

    return attributes[attribute];
  }

  function translateElementAttributes(element, language = getStoredLanguage()) {
    ['title', 'aria-label', 'placeholder'].forEach((attribute) => {
      const originalValue = getOriginalAttribute(element, attribute);

      if (!originalValue) {
        return;
      }

      element.setAttribute(
        attribute,
        language === DEFAULT_LANGUAGE ? originalValue : translateText(originalValue, language),
      );
    });
  }

  function translateTree(root, language = getStoredLanguage()) {
    if (!root) {
      return;
    }

    isTranslating = true;

    try {
      if (root.nodeType === Node.TEXT_NODE) {
        translateNodeText(root, language);
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

      textNodes.forEach((node) => translateNodeText(node, language));

      if (root.querySelectorAll) {
        root.querySelectorAll('[title], [aria-label], [placeholder]').forEach((element) =>
          translateElementAttributes(element, language),
        );
      }
    } finally {
      isTranslating = false;
    }
  }

  function translateDocument(language = getStoredLanguage()) {
    translateTree(document.body || document.documentElement, language);

    const title = document.querySelector('title');

    if (title?.firstChild) {
      translateNodeText(title.firstChild, language);
      document.title = title.textContent;
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
    translateTree(container, activeLanguage);
  }

  function watchDynamicText() {
    const observer = new MutationObserver((mutations) => {
      if (isTranslating) {
        return;
      }

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => translateTree(node));

        if (mutation.type === 'characterData') {
          originalTextByNode.delete(mutation.target);
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

  window.alert = (message) => nativeAlert(translateText(message));
  window.confirm = (message) => nativeConfirm(translateText(message));

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
