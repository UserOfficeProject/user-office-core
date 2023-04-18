import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: 'override',
    fallbackLng: 'override',
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
  });

i18n.services.formatter?.add('lowercase', (value) => {
  return value.toLowerCase();
});

i18n.services.formatter?.add('plural', (value) => {
  return value + 's';
});

i18n.languages = ['override'];

export default i18n;
