import {
  AddTechnicalReviewMutation,
  AddTechnicalReviewMutationVariables,
  AssignInstrumentsToCallMutation,
  AssignInstrumentsToCallMutationVariables,
  AssignProposalsToInstrumentMutation,
  AssignProposalsToInstrumentMutationVariables,
  AssignScientistsToInstrumentMutation,
  AssignScientistsToInstrumentMutationVariables,
  CreateInstrumentMutation,
  CreateInstrumentMutationVariables,
  UpdateTechnicalReviewAssigneeMutation,
  UpdateTechnicalReviewAssigneeMutationVariables,
} from '../../src/generated/sdk';
import { getE2EApi } from './utils';

const createInstrument = (
  createInstrumentInput: CreateInstrumentMutationVariables
): Cypress.Chainable<CreateInstrumentMutation> => {
  const api = getE2EApi();
  const request = api.createInstrument(createInstrumentInput);

  return cy.wrap(request);
};

const assignScientistsToInstrument = (
  assignScientistsToInstrumentInput: AssignScientistsToInstrumentMutationVariables
): Cypress.Chainable<AssignScientistsToInstrumentMutation> => {
  const api = getE2EApi();
  const request = api.assignScientistsToInstrument(
    assignScientistsToInstrumentInput
  );

  return cy.wrap(request);
};

const assignInstrumentToCall = (
  assignInstrumentsToCall: AssignInstrumentsToCallMutationVariables
): Cypress.Chainable<AssignInstrumentsToCallMutation> => {
  const api = getE2EApi();
  const request = api.assignInstrumentsToCall(assignInstrumentsToCall);

  return cy.wrap(request);
};

const assignProposalsToInstrument = (
  assignProposalsToInstrumentInput: AssignProposalsToInstrumentMutationVariables
): Cypress.Chainable<AssignProposalsToInstrumentMutation> => {
  const api = getE2EApi();
  const request = api.assignProposalsToInstrument(
    assignProposalsToInstrumentInput
  );

  return cy.wrap(request);
};

const updateTechnicalReviewAssignee = (
  updateTechnicalReviewAssigneeInput: UpdateTechnicalReviewAssigneeMutationVariables
): Cypress.Chainable<UpdateTechnicalReviewAssigneeMutation> => {
  const api = getE2EApi();
  const request = api.updateTechnicalReviewAssignee(
    updateTechnicalReviewAssigneeInput
  );

  return cy.wrap(request);
};

const addProposalTechnicalReview = (
  addTechnicalReviewInput: AddTechnicalReviewMutationVariables
): Cypress.Chainable<AddTechnicalReviewMutation> => {
  const token = window.localStorage.getItem('token');

  const api = getE2EApi(token);
  const request = api.addTechnicalReview(addTechnicalReviewInput);

  return cy.wrap(request);
};

Cypress.Commands.add('createInstrument', createInstrument);
Cypress.Commands.add(
  'assignScientistsToInstrument',
  assignScientistsToInstrument
);
Cypress.Commands.add(
  'assignProposalsToInstrument',
  assignProposalsToInstrument
);

Cypress.Commands.add('assignInstrumentToCall', assignInstrumentToCall);

Cypress.Commands.add(
  'updateTechnicalReviewAssignee',
  updateTechnicalReviewAssignee
);
Cypress.Commands.add('addProposalTechnicalReview', addProposalTechnicalReview);
