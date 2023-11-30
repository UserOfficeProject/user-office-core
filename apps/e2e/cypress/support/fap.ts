import {
  AssignChairOrSecretaryMutation,
  AssignChairOrSecretaryMutationVariables,
  AssignProposalsToFapMutation,
  AssignProposalsToFapMutationVariables,
  AssignReviewersToFapMutation,
  AssignReviewersToFapMutationVariables,
  AssignFapReviewersToProposalMutation,
  AssignFapReviewersToProposalMutationVariables,
  CreateFapMutation,
  CreateFapMutationVariables,
  GetProposalReviewsQuery,
  GetProposalReviewsQueryVariables,
  SaveFapMeetingDecisionMutation,
  SaveFapMeetingDecisionMutationVariables,
  UpdateReviewMutation,
  UpdateReviewMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createFap = (
  newFapInput: CreateFapMutationVariables
): Cypress.Chainable<CreateFapMutation> => {
  const api = getE2EApi();
  const request = api.createFap(newFapInput);

  return cy.wrap(request);
};

const assignProposalsToFap = (
  assignProposalsToFapInput: AssignProposalsToFapMutationVariables
): Cypress.Chainable<AssignProposalsToFapMutation> => {
  const api = getE2EApi();
  const request = api.assignProposalsToFap(assignProposalsToFapInput);

  return cy.wrap(request);
};

const assignChairOrSecretary = (
  assignChairOrSecretaryInput: AssignChairOrSecretaryMutationVariables
): Cypress.Chainable<AssignChairOrSecretaryMutation> => {
  const api = getE2EApi();
  const request = api.assignChairOrSecretary(assignChairOrSecretaryInput);

  return cy.wrap(request);
};

const assignReviewersToFap = (
  assignReviewersToFapInput: AssignReviewersToFapMutationVariables
): Cypress.Chainable<AssignReviewersToFapMutation> => {
  const api = getE2EApi();
  const request = api.assignReviewersToFap(assignReviewersToFapInput);

  return cy.wrap(request);
};

const assignFapReviewersToProposal = (
  assignFapReviewersToProposalInput: AssignFapReviewersToProposalMutationVariables
): Cypress.Chainable<AssignFapReviewersToProposalMutation> => {
  const api = getE2EApi();
  const request = api.assignFapReviewersToProposal(
    assignFapReviewersToProposalInput
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

const saveFapMeetingDecision = (
  saveFapMeetingDecisionInput: SaveFapMeetingDecisionMutationVariables
): Cypress.Chainable<SaveFapMeetingDecisionMutation> => {
  const api = getE2EApi();
  const request = api.saveFapMeetingDecision(saveFapMeetingDecisionInput);

  return cy.wrap(request);
};

Cypress.Commands.add('createFap', createFap);
Cypress.Commands.add('assignChairOrSecretary', assignChairOrSecretary);
Cypress.Commands.add('assignReviewersToFap', assignReviewersToFap);
Cypress.Commands.add('assignProposalsToFap', assignProposalsToFap);
Cypress.Commands.add(
  'assignFapReviewersToProposal',
  assignFapReviewersToProposal
);
Cypress.Commands.add('getProposalReviews', getProposalReviews);
Cypress.Commands.add('updateReview', updateReview);
Cypress.Commands.add('saveFapMeetingDecision', saveFapMeetingDecision);
