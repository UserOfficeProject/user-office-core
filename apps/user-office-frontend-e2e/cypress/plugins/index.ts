// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import fs from 'fs';
import { createServer, Server } from 'http';

import webpackPreprocessor from '@cypress/webpack-preprocessor';

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

module.exports = (on: Cypress.PluginEvents) => {
  const options = {
    // send in the options from your webpack.config.js, so it works the same
    // as your app's code
    webpackOptions: require('../../webpack.config'),
    watchOptions: {},
  };

  // NOTE: This is needed for newest version of graphql-request to work in the e2e tests because it is commonjs module from version 5.2.0.
  on('file:preprocessor', webpackPreprocessor(options));
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('after:screenshot', (details: Cypress.ScreenshotDetails) => {
    const fileNamePrefix = replaceInvalidFileNameCharacters(details.takenAt);
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
};
