import path from 'path';

import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

i18next.use(Backend).init({
  initAsync: false,
  lng: 'override',
  fallbackLng: 'override',
  backend: {
    loadPath: path.resolve(
      process.env.TRANSLATION_PATH || '',
      '{{lng}}/translation.json'
    ),
  },
});

i18next.languages = ['override'];

export default i18next;
