import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../locales/en.json';
import heTranslations from '../locales/he.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  he: {
    translation: heTranslations,
  },
};

// Function to initialize i18n with a specific language
export const initializeI18n = (language: string = 'en') => {
  if (i18n.isInitialized) {
    // If already initialized, just change the language
    i18n.changeLanguage(language);
    return i18n;
  }

  return i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: language, // Use the provided language
      fallbackLng: 'en',
      debug: false, // Disable debug to reduce console noise

      interpolation: {
        escapeValue: false, // React already does escaping
      },

      detection: {
        // Disable automatic language detection to prevent unwanted changes
        order: [],
        caches: [],
      },

      // RTL language configuration
      supportedLngs: ['en', 'he'],
      nonExplicitSupportedLngs: false,

      // Ensure consistent behavior between server and client
      react: {
        useSuspense: false,
      },

      // Add server-side rendering support
      initImmediate: false,
    });
};

// Initialize with default language for server-side rendering
initializeI18n('he');

// Only add client-side specific features when in browser
if (typeof window !== 'undefined') {
  // Update document direction when language changes
  i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  });

  // Store language preference in localStorage when it changes
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem('poker-tracker-language', lng);
  });
}

export default i18n;
