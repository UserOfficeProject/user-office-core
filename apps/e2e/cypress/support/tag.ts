import {
  AssignCallsToTagMutation,
  AssignCallsToTagMutationVariables,
  CreateRoleMutation,
  CreateTagMutation,
  CreateTagMutationVariables,
  AssignInstrumentsToTagMutationVariables,
  AssignInstrumentsToTagMutation,
  UpdateRoleTagsMutation,
  UpdateRoleTagsMutationVariables,
  CreateRoleMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createTag = (
  updateTagInput: CreateTagMutationVariables
): Cypress.Chainable<CreateTagMutation> => {
  const api = getE2EApi();
  const request = api.createTag(updateTagInput);

  return cy.wrap(request);
};

const createRole = (
  createRoleInput: CreateRoleMutationVariables
): Cypress.Chainable<CreateRoleMutation> => {
  const api = getE2EApi();
  const request = api.createRole(createRoleInput);

  return cy.wrap(request);
};

const addInstrumentToTag = (
  addInstrumentsToTag: AssignInstrumentsToTagMutationVariables
): Cypress.Chainable<AssignInstrumentsToTagMutation> => {
  const api = getE2EApi();
  const request = api.assignInstrumentsToTag(addInstrumentsToTag);

  return cy.wrap(request);
};

const assignCallsToTag = (
  assignCallsInput: AssignCallsToTagMutationVariables
): Cypress.Chainable<AssignCallsToTagMutation> => {
  const api = getE2EApi();
  const request = api.assignCallsToTag(assignCallsInput);

  return cy.wrap(request);
};

const updateRoleTags = (
  updateRoleTagsInput: UpdateRoleTagsMutationVariables
): Cypress.Chainable<UpdateRoleTagsMutation> => {
  const api = getE2EApi();
  const request = api.updateRoleTags(updateRoleTagsInput);

  return cy.wrap(request);
};

Cypress.Commands.add('createTag', createTag);
Cypress.Commands.add('createRole', createRole);
Cypress.Commands.add('addInstrumentToTag', addInstrumentToTag);
Cypress.Commands.add('assignCallsToTag', assignCallsToTag);
Cypress.Commands.add('updateRoleTags', updateRoleTags);
