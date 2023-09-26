import {
  CreatePredefinedMessageInput,
  CreatePredefinedMessageMutation,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createPredefinedMessage = (
  newPredefinedMessageInput: CreatePredefinedMessageInput
): Cypress.Chainable<CreatePredefinedMessageMutation> => {
  const api = getE2EApi();
  const request = api.createPredefinedMessage({
    input: newPredefinedMessageInput,
  });

  return cy.wrap(request);
};

Cypress.Commands.add('createPredefinedMessage', createPredefinedMessage);
