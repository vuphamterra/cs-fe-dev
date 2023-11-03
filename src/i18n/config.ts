import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  fallbackLng: 'enUs',
  lng: 'enUs',
  resources: {
    enUs: {
      translations: require('./locales/en-us/translations.json'),
    },
    vn: {
      translations: require('./locales/vn/translations.json'),
    },
  },
  ns: ['translations'],
  defaultNS: 'translations',
});

i18n.languages = ['enUs', 'vn'];

export default i18n;
