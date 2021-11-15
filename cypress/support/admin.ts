import { GraphQLClient } from 'graphql-request';
import { getE2EApi } from './utils';

const resetDB = (includeSeeds = false) => {
  const api = getE2EApi();
  const request = api.prepareDB({ includeSeeds });

  cy.wrap(request);
};

const resetSchedulerDB = (includeSeeds = false) => {
  const api = getE2EApi();
  const request = api.prepareSchedulerDB({ includeSeeds });

  cy.wrap(request);
};

Cypress.Commands.add('resetDB', resetDB);
Cypress.Commands.add('resetSchedulerDB', resetSchedulerDB);
