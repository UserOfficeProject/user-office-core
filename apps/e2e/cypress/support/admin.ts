import {
  GetSettingsQuery,
  PrepareDbMutation,
  SetPageContentMutation,
  SetPageContentMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const resetDB = (
  includeSeeds = false
): Cypress.Chainable<PrepareDbMutation> => {
  const api = getE2EApi();
  const request = api.prepareDB({ includeSeeds });

  return cy.wrap(request);
};

const getAndStoreAppSettings = (): Cypress.Chainable<GetSettingsQuery> => {
  const api = getE2EApi();
  const request = api.getSettings().then((resp) => {
    window.localStorage.setItem('settings', JSON.stringify(resp.settings));

    return resp;
  });

  return cy.wrap(request);
};

const setPageContent = (
  setPageContentInput: SetPageContentMutationVariables
): Cypress.Chainable<SetPageContentMutation> => {
  const api = getE2EApi();
  const request = api.setPageContent(setPageContentInput);

  return cy.wrap(request);
};

Cypress.Commands.add('resetDB', resetDB);
Cypress.Commands.add('setPageContent', setPageContent);
Cypress.Commands.add('getAndStoreAppSettings', getAndStoreAppSettings);
