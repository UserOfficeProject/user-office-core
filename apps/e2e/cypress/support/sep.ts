import {
  AssignChairOrSecretaryMutation,
  AssignChairOrSecretaryMutationVariables,
  AssignProposalsToSepMutation,
  AssignProposalsToSepMutationVariables,
  AssignReviewersToSepMutation,
  AssignReviewersToSepMutationVariables,
  AssignSepReviewersToProposalMutation,
  AssignSepReviewersToProposalMutationVariables,
  CreateSepMutation,
  CreateSepMutationVariables,
  GetProposalReviewsQuery,
  GetProposalReviewsQueryVariables,
  SaveSepMeetingDecisionMutation,
  SaveSepMeetingDecisionMutationVariables,
  UpdateReviewMutation,
  UpdateReviewMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createSep = (
  newSepInput: CreateSepMutationVariables
): Cypress.Chainable<CreateSepMutation> => {
  const api = getE2EApi();
  const request = api.createSEP(newSepInput);

  return cy.wrap(request);
};

const assignProposalsToSep = (
  assignProposalsToSepInput: AssignProposalsToSepMutationVariables
): Cypress.Chainable<AssignProposalsToSepMutation> => {
  const api = getE2EApi();
  const request = api.assignProposalsToSep(assignProposalsToSepInput);

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

const assignSepReviewersToProposal = (
  assignSepReviewersToProposalInput: AssignSepReviewersToProposalMutationVariables
): Cypress.Chainable<AssignSepReviewersToProposalMutation> => {
  const api = getE2EApi();
  const request = api.assignSepReviewersToProposal(
    assignSepReviewersToProposalInput
  );

  return cy.wrap(request);
};

const updateReview = (
  updateReviewInput: UpdateReviewMutationVariables
): Cypress.Chainable<UpdateReviewMutation> => {
  const api = getE2EApi();
  const request = api.updateReview(updateReviewInput);

  return cy.wrap(request);
};

const getProposalReviews = (
  getProposalReviewsVariables: GetProposalReviewsQueryVariables
): Cypress.Chainable<GetProposalReviewsQuery> => {
  const api = getE2EApi();
  const request = api.getProposalReviews(getProposalReviewsVariables);

  return cy.wrap(request);
};

const saveSepMeetingDecision = (
  saveSepMeetingDecisionInput: SaveSepMeetingDecisionMutationVariables
): Cypress.Chainable<SaveSepMeetingDecisionMutation> => {
  const api = getE2EApi();
  const request = api.saveSepMeetingDecision(saveSepMeetingDecisionInput);

  return cy.wrap(request);
};

Cypress.Commands.add('createSep', createSep);
Cypress.Commands.add('assignChairOrSecretary', assignChairOrSecretary);
Cypress.Commands.add('assignReviewersToSep', assignReviewersToSep);
Cypress.Commands.add('assignProposalsToSep', assignProposalsToSep);
Cypress.Commands.add(
  'assignSepReviewersToProposal',
  assignSepReviewersToProposal
);
Cypress.Commands.add('getProposalReviews', getProposalReviews);
Cypress.Commands.add('updateReview', updateReview);
Cypress.Commands.add('saveSepMeetingDecision', saveSepMeetingDecision);
