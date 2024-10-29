import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './locales/en/en.json';
import translationTr from './locales/tr/tr.json';
import translationDe from './locales/de/de.json';
import translationFr from './locales/fr/fr.json';
import translationEs from './locales/es/es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translationEn,
      },
      tr: {
        translation: translationTr,
      },
      de: {
        translation: translationDe,
      },
      fr: {
        translation: translationFr,
      },
      es: {
        translation: translationEs,
      },
    },
    lng: 'en', // Varsayılan dil
//  lng: navigator.language || 'en', // Varsayılan dili tarayıcı dili yapmak için bunu aç, üsttekini kapat.

    fallbackLng: 'en', // Belirli bir dil bulunamazsa kullanılacak dil
    interpolation: {
      escapeValue: false, // React kendisi koruma sağladığı için bu değeri false yapıyoruz
    },
  });

export default i18n;
