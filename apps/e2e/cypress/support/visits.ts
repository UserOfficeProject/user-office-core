import { CreateVisitMutationVariables } from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createVisit = (createVisitInput: CreateVisitMutationVariables) => {
  const api = getE2EApi();
  const request = api.createVisit(createVisitInput);

  cy.wrap(request);
};

Cypress.Commands.add('createVisit', createVisit);
