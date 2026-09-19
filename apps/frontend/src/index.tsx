import React from 'react';
import * as ReactDOM from 'react-dom/client';

import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import './i18n';

const DYNAMIC_IMPORT_ERROR_EVENT = 'dynamic-import-error';

const fetchBuildVersion = async (): Promise<string> => {
  const response = await fetch('/build-version.txt');

  if (!response.ok) {
    throw new Error('Unable to fetch build version');
  }

  return response.text();
};

let buildVersion: string | undefined;

void fetchBuildVersion()
  .then((version) => {
    buildVersion = version;
  })
  .catch(() => {});

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();

  void fetchBuildVersion()
    .then((version) => {
      if (buildVersion !== undefined && buildVersion !== version) {
        window.location.reload();

        return;
      }

      window.dispatchEvent(new CustomEvent(DYNAMIC_IMPORT_ERROR_EVENT));
    })
    .catch(() => {
      window.dispatchEvent(new CustomEvent(DYNAMIC_IMPORT_ERROR_EVENT));
    });
});

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
