import { CreateCallInput } from '../../src/generated/sdk';
import { getE2EApi } from './utils';

const createCall = (newCallInput: CreateCallInput) => {
  const api = getE2EApi();
  const request = api.createCall(newCallInput);

  cy.wrap(request);
};

Cypress.Commands.add('createCall', createCall);
