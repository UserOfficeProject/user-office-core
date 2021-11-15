import { CreateCallInput, CreateCallMutation } from '../../src/generated/sdk';
import { getE2EApi } from './utils';

const createCall = (
  newCallInput: CreateCallInput
): Cypress.Chainable<CreateCallMutation> => {
  const api = getE2EApi();
  const request = api.createCall(newCallInput);

  return cy.wrap(request);
};

Cypress.Commands.add('createCall', createCall);
