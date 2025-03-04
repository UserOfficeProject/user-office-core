import {
  CreateInviteMutation,
  CreateInviteMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createInvite = (
  createInviteInput: CreateInviteMutationVariables
): Cypress.Chainable<CreateInviteMutation> => {
  const api = getE2EApi();
  const request = api.createInvite(createInviteInput);

  return cy.wrap(request);
};

Cypress.Commands.add('createInvite', createInvite);
