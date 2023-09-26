import {
  CreateCallInput,
  CreateCallMutation,
  UpdateCallMutation,
  UpdateCallMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createCall = (
  newCallInput: CreateCallInput
): Cypress.Chainable<CreateCallMutation> => {
  const api = getE2EApi();
  const request = api.createCall(newCallInput);

  return cy.wrap(request);
};

const updateCall = (
  updateCallInput: UpdateCallMutationVariables
): Cypress.Chainable<UpdateCallMutation> => {
  const api = getE2EApi();
  const request = api.updateCall(updateCallInput);

  return cy.wrap(request);
};

Cypress.Commands.add('createCall', createCall);
Cypress.Commands.add('updateCall', updateCall);
