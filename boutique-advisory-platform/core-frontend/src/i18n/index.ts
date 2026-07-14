'use client'

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslations from './locales/en.json';
import kmTranslations from './locales/km.json';
import zhTranslations from './locales/zh.json';

export const SUPPORTED_LANGUAGES = ['en', 'km', 'zh'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  en: { translation: enTranslations },
  km: { translation: kmTranslations },
  zh: { translation: zhTranslations },
};

// Resolve the initial language from (1) a saved choice, then (2) the browser's
// preferred language, then (3) English. Previously nothing read the saved
// choice or the browser locale, so the app always loaded in English even after
// a user picked Khmer — language switching effectively did nothing on reload.
function detectInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem('selectedLanguage');
    if (saved && (SUPPORTED_LANGUAGES as readonly string[]).includes(saved)) {
      return saved as AppLanguage;
    }
    const nav = (window.navigator.language || 'en').toLowerCase();
    if (nav.startsWith('km')) return 'km';
    if (nav.startsWith('zh')) return 'zh';
  } catch {
    /* localStorage/navigator unavailable — fall through to default */
  }
  return 'en';
}

// Only initialize if not already initialized
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: detectInitialLanguage(),
      fallbackLng: 'en',
      supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
      debug: false,
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false,
      },
    });

  if (typeof window !== 'undefined') {
    // Persist every language change so the choice survives a reload.
    i18n.on('languageChanged', (lng: string) => {
      try {
        window.localStorage.setItem('selectedLanguage', lng);
        document.documentElement.lang = lng;
      } catch {
        /* ignore storage errors */
      }
    });

    // Apply changes coming from the LanguageSwitcher (which broadcasts an event)
    // so the whole app re-renders in the chosen language, not just localStorage.
    window.addEventListener('languageChanged', (e: Event) => {
      const lng = (e as CustomEvent<{ language?: string }>).detail?.language;
      if (lng && i18n.language !== lng) {
        i18n.changeLanguage(lng);
      }
    });

    document.documentElement.lang = i18n.language;
  }
}

export default i18n;
