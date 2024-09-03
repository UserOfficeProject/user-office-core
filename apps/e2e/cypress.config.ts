import fs from 'fs';
import { createServer, Server } from 'http';

import webpackPreprocessor from '@cypress/webpack-preprocessor';
import { defineConfig } from 'cypress';

import {
  convertXlsxToJson,
  downloadFile,
  readPdf,
  unzip,
} from './cypress/support/fileUtilTasks';

function replaceLastOccurrenceInString(
  string: string,
  find: string,
  replace: string
) {
  const lastIndex = string.lastIndexOf(find);

  if (lastIndex === -1) {
    return string;
  }

  const beginString = string.substring(0, lastIndex);
  const endString = string.substring(lastIndex + find.length);

  return beginString + replace + endString;
}

function replaceInvalidFileNameCharacters(filename: string) {
  return filename.replace(/:/g, '.');
}

let server: Server;

const preProcessorOptions = {
  // send in the options from your webpack.config.js, so it works the same
  // as your app's code
  webpackOptions: require('./webpack.config'),
  watchOptions: {},
};

module.exports = defineConfig({
  video: false,
  viewportWidth: 1920,
  viewportHeight: 1080,
  retries: 1,
  scrollBehavior: 'center',
  defaultCommandTimeout: 30000,
  chromeWebSecurity: false,
  env: {
    SVC_ACC_TOKEN:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjowLCJ1c2VyX3RpdGxlIjoiTXIuIiwiZmlyc3RuYW1lIjoiU2VydmljZSBBY2NvdW50IiwibWlkZGxlbmFtZSI6IiIsImxhc3RuYW1lIjoiIiwidXNlcm5hbWUiOiJzZXJ2aWNlIiwicHJlZmVycmVkbmFtZSI6IiIsIm9yY2lkIjoiIiwicmVmcmVzaFRva2VuIjoiIiwiZ2VuZGVyIjoibWFsZSIsIm5hdGlvbmFsaXR5IjoxLCJiaXJ0aGRhdGUiOiIyMDAwLTA0LTAxVDIyOjAwOjAwLjAwMFoiLCJvcmdhbmlzYXRpb24iOjEsImRlcGFydG1lbnQiOiIiLCJwb3NpdGlvbiI6IiIsImVtYWlsIjoic2VydmljZUB1c2Vyb2ZmaWNlLmVzcy5ldSIsImVtYWlsVmVyaWZpZWQiOnRydWUsInRlbGVwaG9uZSI6IiIsInRlbGVwaG9uZV9hbHQiOiIiLCJwbGFjZWhvbGRlciI6ZmFsc2UsImNyZWF0ZWQiOiIyMDIwLTA4LTEwVDE2OjQwOjAyLjk1NloiLCJ1cGRhdGVkIjoiMjAyMC0wOC0xMFQxNjo0MDowMy4yNjhaIn0sInJvbGVzIjpbeyJpZCI6Miwic2hvcnRDb2RlIjoidXNlcl9vZmZpY2VyIiwidGl0bGUiOiJVc2VyIE9mZmljZXIifV0sImN1cnJlbnRSb2xlIjp7ImlkIjoyLCJzaG9ydENvZGUiOiJ1c2VyX29mZmljZXIiLCJ0aXRsZSI6IlVzZXIgT2ZmaWNlciJ9LCJpYXQiOjE1OTcwNzc3NjF9.y_coY649frw5dgl549tGjirF99nqwz1-BrUAILhE6pI',
    DEV_AUTH_SERVER_URL: 'http://localhost:5000',
  },
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    setupNodeEvents(on) {
      // `on` is used to hook into various events Cypress emits
      // `config` is the resolved Cypress config
      on('after:screenshot', (details: Cypress.ScreenshotDetails) => {
        const fileNamePrefix = replaceInvalidFileNameCharacters(
          details.takenAt
        );
        const newPath = replaceLastOccurrenceInString(
          details.path,
          '/',
          `/${fileNamePrefix} -- `
        );

        return new Promise((resolve, reject) => {
          fs.rename(details.path, newPath, (err) => {
            if (err) return reject(err);

            // because we renamed and moved the image, resolve with the new path
            // so it is accurate in the test results
            resolve({ path: newPath });
          });
        });
      });

      // NOTE: This is needed for newest version of graphql-request to work in the e2e tests because it is commonjs module from version 5.2.0.
      on('file:preprocessor', webpackPreprocessor(preProcessorOptions));

      on('task', {
        mockServer({ interceptUrl, fixture }) {
          // close any previous instance
          if (server) server.close();

          const url = new URL(interceptUrl);
          const data = JSON.stringify(fixture);
          server = createServer((req, res) => {
            if (req.url === url.pathname) {
              res.end(data);
            } else {
              res.end();
            }
          });

          server.listen(url.port);

          return null;
        },
      });

      on('task', { downloadFile });

      on('task', {
        readPdf,
      });

      on('task', { unzip });

      on('task', { convertXlsxToJson });

      on('task', {
        log(message) {
          console.log(message);

          return null;
        },
      });
    },
  },
});
