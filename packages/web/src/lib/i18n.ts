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

// Only initialize i18n on the client side
if (typeof window !== 'undefined') {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en', // default language
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',

      interpolation: {
        escapeValue: false, // React already does escaping
      },

      detection: {
        // Order of language detection
        order: ['localStorage', 'navigator', 'htmlTag'],

        // Keys to store language preference
        lookupLocalStorage: 'poker-tracker-language',

        // Don't cache language detection
        caches: ['localStorage'],
      },

      // RTL language configuration
      supportedLngs: ['en', 'he'],
      nonExplicitSupportedLngs: false,
    });

  // Update document direction when language changes
  i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  });
} else {
  // Server-side initialization without React-specific features
  i18n.init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    supportedLngs: ['en', 'he'],
    nonExplicitSupportedLngs: false,
  });
}

export default i18n;
