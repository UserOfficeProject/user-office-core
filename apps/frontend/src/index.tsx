import React from 'react';
import * as ReactDOM from 'react-dom/client';

import { sendClientLog } from 'hooks/common/useDataApi';

import './index.css';
import App, { DYNAMIC_IMPORT_ERROR_EVENT } from './components/App';
import * as serviceWorker from './serviceWorker';
import './i18n';

const fetchBuildVersion = async (): Promise<string> => {
  const response = await fetch('/build-version.txt');

  if (!response.ok) {
    throw new Error('Unable to fetch build version');
  }

  return response.text();
};

let buildVersion: string | undefined;

fetchBuildVersion()
  .then((version) => {
    buildVersion = version;
  })
  .catch((error) => {
    sendClientLog(
      `Failed to fetch build version: ${String(error)}`,
      localStorage.getItem('token')
    );
  });

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();

  fetchBuildVersion()
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
