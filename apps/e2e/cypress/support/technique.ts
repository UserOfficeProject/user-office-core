import {
  AssignInstrumentsToTechniqueMutation,
  AssignInstrumentsToTechniqueMutationVariables,
  CreateTechniqueMutation,
  CreateTechniqueMutationVariables,
  RemoveInstrumentsFromTechniqueMutation,
  RemoveInstrumentsFromTechniqueMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createTechnique = (
  createTechniqueInput: CreateTechniqueMutationVariables
): Cypress.Chainable<CreateTechniqueMutation> => {
  const api = getE2EApi();
  const request = api.createTechnique(createTechniqueInput);

  return cy.wrap(request);
};

const assignInstrumentsToTechnique = (
  assignInstrumentsToTechniqueInput: AssignInstrumentsToTechniqueMutationVariables
): Cypress.Chainable<AssignInstrumentsToTechniqueMutation> => {
  const api = getE2EApi();
  const request = api.assignInstrumentsToTechnique(
    assignInstrumentsToTechniqueInput
  );

  return cy.wrap(request);
};

const removeInstrumentsFromTechnique = (
  removeInstrumentsFromTechniqueInput: RemoveInstrumentsFromTechniqueMutationVariables
): Cypress.Chainable<RemoveInstrumentsFromTechniqueMutation> => {
  const api = getE2EApi();
  const request = api.removeInstrumentsFromTechnique(
    removeInstrumentsFromTechniqueInput
  );

  return cy.wrap(request);
};

Cypress.Commands.add('createTechnique', createTechnique);
Cypress.Commands.add(
  'assignInstrumentsToTechnique',
  assignInstrumentsToTechnique
);
Cypress.Commands.add(
  'removeInstrumentsFromTechnique',
  removeInstrumentsFromTechnique
);
