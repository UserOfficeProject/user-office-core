import {
  CreateFacilityMutation,
  CreateFacilityMutationVariables,
  AssignUsersToFacilityMutationVariables,
  AssignUsersToFacilityMutation,
  AssignInstrumentsToFacilityMutationVariables,
  AssignInstrumentsToFacilityMutation,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createFacility = (
  updateFacilityInput: CreateFacilityMutationVariables
): Cypress.Chainable<CreateFacilityMutation> => {
  const api = getE2EApi();
  const request = api.createFacility(updateFacilityInput);

  return cy.wrap(request);
};

const addUserToFacility = (
  addUserToFacility: AssignUsersToFacilityMutationVariables
): Cypress.Chainable<AssignUsersToFacilityMutation> => {
  const api = getE2EApi();
  const request = api.assignUsersToFacility(addUserToFacility);

  return cy.wrap(request);
};

const addInstrumentToFacility = (
  addInstrumentsToFacility: AssignInstrumentsToFacilityMutationVariables
): Cypress.Chainable<AssignInstrumentsToFacilityMutation> => {
  const api = getE2EApi();
  const request = api.assignInstrumentsToFacility(addInstrumentsToFacility);

  return cy.wrap(request);
};

Cypress.Commands.add('createFacility', createFacility);
Cypress.Commands.add('addUserToFacility', addUserToFacility);
Cypress.Commands.add('addInstrumentToFacility', addInstrumentToFacility);
