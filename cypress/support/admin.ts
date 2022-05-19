import { getE2EApi } from './utils';

const resetDB = (includeSeeds = false) => {
  const api = getE2EApi();
  const request = api.prepareDB({ includeSeeds });

  cy.wrap(request, { timeout: 1500000 });
};

Cypress.Commands.add('resetDB', resetDB);
