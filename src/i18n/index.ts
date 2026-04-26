import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import fr from './fr.json';
import en from './en.json';
import ar from './ar.json';

export const getSystemLocale = (): string => {
  const locales = getLocales();
  return locales[0]?.languageCode ?? 'fr';
};

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: getSystemLocale(),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
export { i18n };
