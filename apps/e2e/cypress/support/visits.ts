import {
  CreateVisitMutation,
  CreateVisitMutationVariables,
  CreateVisitRegistrationMutation,
  CreateVisitRegistrationMutationVariables,
  SubmitVisitRegistrationMutation,
  SubmitVisitRegistrationMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createVisit = (
  createVisitInput: CreateVisitMutationVariables
): Cypress.Chainable<CreateVisitMutation> => {
  const api = getE2EApi();
  const request = api.createVisit(createVisitInput);

  return cy.wrap(request);
};

const createVisitRegistration = (
  input: CreateVisitRegistrationMutationVariables
): Cypress.Chainable<CreateVisitRegistrationMutation> => {
  const api = getE2EApi();
  const request = api.createVisitRegistration(input);

  return cy.wrap(request);
};

const submitVisitRegistration = (
  input: SubmitVisitRegistrationMutationVariables
): Cypress.Chainable<SubmitVisitRegistrationMutation> => {
  const api = getE2EApi();
  const request = api.submitVisitRegistration(input);

  return cy.wrap(request);
};

Cypress.Commands.add('createVisit', createVisit);
Cypress.Commands.add('createVisitRegistration', createVisitRegistration);
Cypress.Commands.add('submitVisitRegistration', submitVisitRegistration);
