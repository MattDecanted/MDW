import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false, // Set to true for development debugging
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    backend: {
      // Load translations from public/locales/{{lng}}.json
      loadPath: '/locales/{{lng}}.json',
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: false, // Avoid Suspense errors
    },

    // Supported languages
    supportedLngs: ['en', 'ko', 'zh', 'ja', 'da'],

    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],

    // Key separator for nested objects
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n;