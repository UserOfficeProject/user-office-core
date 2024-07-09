import {
  AssignChairOrSecretaryMutation,
  AssignChairOrSecretaryMutationVariables,
  AssignProposalsToFapsMutation,
  AssignProposalsToFapsMutationVariables,
  AssignReviewersToFapMutation,
  AssignReviewersToFapMutationVariables,
  AssignFapReviewersToProposalsMutation,
  AssignFapReviewersToProposalsMutationVariables,
  CreateFapMutation,
  CreateFapMutationVariables,
  GetProposalReviewsQuery,
  GetProposalReviewsQueryVariables,
  SaveFapMeetingDecisionMutation,
  SaveFapMeetingDecisionMutationVariables,
  UpdateReviewMutation,
  UpdateReviewMutationVariables,
  ReorderFapMeetingDecisionProposalsMutation,
  ReorderFapMeetingDecisionProposalsMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const api = getE2EApi();

const createFap = (
  newFapInput: CreateFapMutationVariables
): Cypress.Chainable<CreateFapMutation> => {
  const request = api.createFap(newFapInput);

  return cy.wrap(request);
};

const assignProposalsToFaps = (
  assignProposalsToFapInput: AssignProposalsToFapsMutationVariables
): Cypress.Chainable<AssignProposalsToFapsMutation> => {
  const request = api.assignProposalsToFaps(assignProposalsToFapInput);

  return cy.wrap(request);
};

const assignChairOrSecretary = (
  assignChairOrSecretaryInput: AssignChairOrSecretaryMutationVariables
): Cypress.Chainable<AssignChairOrSecretaryMutation> => {
  const request = api.assignChairOrSecretary(assignChairOrSecretaryInput);

  return cy.wrap(request);
};

const assignReviewersToFap = (
  assignReviewersToFapInput: AssignReviewersToFapMutationVariables
): Cypress.Chainable<AssignReviewersToFapMutation> => {
  const request = api.assignReviewersToFap(assignReviewersToFapInput);

  return cy.wrap(request);
};

const assignFapReviewersToProposals = (
  assignFapReviewersToProposalInput: AssignFapReviewersToProposalsMutationVariables
): Cypress.Chainable<AssignFapReviewersToProposalsMutation> => {
  const request = api.assignFapReviewersToProposals(
    assignFapReviewersToProposalInput
  );

  return cy.wrap(request);
};

const updateReview = (
  updateReviewInput: UpdateReviewMutationVariables
): Cypress.Chainable<UpdateReviewMutation> => {
  const request = api.updateReview(updateReviewInput);

  return cy.wrap(request);
};

const getProposalReviews = (
  getProposalReviewsVariables: GetProposalReviewsQueryVariables
): Cypress.Chainable<GetProposalReviewsQuery> => {
  const request = api.getProposalReviews(getProposalReviewsVariables);

  return cy.wrap(request);
};

const saveFapMeetingDecision = (
  saveFapMeetingDecisionInput: SaveFapMeetingDecisionMutationVariables
): Cypress.Chainable<SaveFapMeetingDecisionMutation> => {
  const request = api.saveFapMeetingDecision(saveFapMeetingDecisionInput);

  return cy.wrap(request);
};

const reorderFapMeetingDecisionProposals = (
  reorderFapMeetingDecisionProposalsInput: ReorderFapMeetingDecisionProposalsMutationVariables
): Cypress.Chainable<ReorderFapMeetingDecisionProposalsMutation> => {
  const request = api.reorderFapMeetingDecisionProposals(
    reorderFapMeetingDecisionProposalsInput
  );

  return cy.wrap(request);
};

Cypress.Commands.add('createFap', createFap);
Cypress.Commands.add('assignChairOrSecretary', assignChairOrSecretary);
Cypress.Commands.add('assignReviewersToFap', assignReviewersToFap);
Cypress.Commands.add('assignProposalsToFaps', assignProposalsToFaps);
Cypress.Commands.add(
  'assignFapReviewersToProposals',
  assignFapReviewersToProposals
);
Cypress.Commands.add('getProposalReviews', getProposalReviews);
Cypress.Commands.add('updateReview', updateReview);
Cypress.Commands.add('saveFapMeetingDecision', saveFapMeetingDecision);
Cypress.Commands.add(
  'reorderFapMeetingDecisionProposals',
  reorderFapMeetingDecisionProposals
);
