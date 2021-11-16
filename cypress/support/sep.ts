import {
  AssignChairOrSecretaryMutation,
  AssignChairOrSecretaryMutationVariables,
  AssignReviewersToSepMutation,
  AssignReviewersToSepMutationVariables,
  CreateSepMutation,
  CreateSepMutationVariables,
} from '../../src/generated/sdk';
import { getE2EApi } from './utils';

const createSep = (
  newSepInput: CreateSepMutationVariables
): Cypress.Chainable<CreateSepMutation> => {
  const api = getE2EApi();
  const request = api.createSEP(newSepInput);

  return cy.wrap(request);
};

const assignChairOrSecretary = (
  assignChairOrSecretaryInput: AssignChairOrSecretaryMutationVariables
): Cypress.Chainable<AssignChairOrSecretaryMutation> => {
  const api = getE2EApi();
  const request = api.assignChairOrSecretary(assignChairOrSecretaryInput);

  return cy.wrap(request);
};

const assignReviewersToSep = (
  assignReviewersToSepInput: AssignReviewersToSepMutationVariables
): Cypress.Chainable<AssignReviewersToSepMutation> => {
  const api = getE2EApi();
  const request = api.assignReviewersToSEP(assignReviewersToSepInput);

  return cy.wrap(request);
};

Cypress.Commands.add('createSep', createSep);
Cypress.Commands.add('assignChairOrSecretary', assignChairOrSecretary);
Cypress.Commands.add('assignReviewersToSep', assignReviewersToSep);
