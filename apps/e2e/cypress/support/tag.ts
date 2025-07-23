import {
  CreateTagMutation,
  CreateTagMutationVariables,
  AssignInstrumentsToTagMutationVariables,
  AssignInstrumentsToTagMutation,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createTag = (
  updateTagInput: CreateTagMutationVariables
): Cypress.Chainable<CreateTagMutation> => {
  const api = getE2EApi();
  const request = api.createTag(updateTagInput);

  return cy.wrap(request);
};

const addInstrumentToTag = (
  addInstrumentsToTag: AssignInstrumentsToTagMutationVariables
): Cypress.Chainable<AssignInstrumentsToTagMutation> => {
  const api = getE2EApi();
  const request = api.assignInstrumentsToTag(addInstrumentsToTag);

  return cy.wrap(request);
};

Cypress.Commands.add('createTag', createTag);
Cypress.Commands.add('addInstrumentToTag', addInstrumentToTag);
