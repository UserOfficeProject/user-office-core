import {
  AssignChairOrSecretaryMutation,
  AssignChairOrSecretaryMutationVariables,
  CreateFapMutation,
  CreateFapMutationVariables,
  AssignReviewersToFapMutationVariables,
  AssignReviewersToFapMutation,
  AssignFapReviewersToProposalsMutationVariables,
  AssignFapReviewersToProposalsMutation,
  AssignProposalsToFapsMutation,
  AssignProposalsToFapsMutationVariables,
  SaveFapMeetingDecisionMutationVariables,
  SaveFapMeetingDecisionMutation,
  UpdateReviewMutationVariables,
  UpdateReviewMutation,
  GetProposalReviewsQueryVariables,
  GetProposalReviewsQuery,
  ReorderFapMeetingDecisionProposalsMutationVariables,
  ReorderFapMeetingDecisionProposalsMutation,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates new fap with values passed.
       *
       * @returns {typeof createFap}
       * @memberof Chainable
       * @example
       *    cy.createFap(newFapInput: CreateFapMutationVariables)
       */
      createFap: (
        newFapInput: CreateFapMutationVariables
      ) => Cypress.Chainable<CreateFapMutation>;

      /**
       * Assign chair or secretary to existing fap.
       *
       * @returns {typeof assignChairOrSecretary}
       * @memberof Chainable
       * @example
       *    cy.assignChairOrSecretary(assignChairOrSecretaryInput: AssignChairOrSecretaryMutationVariables)
       */
      assignChairOrSecretary: (
        assignChairOrSecretaryInput: AssignChairOrSecretaryMutationVariables
      ) => Cypress.Chainable<AssignChairOrSecretaryMutation>;

      /**
       * Assign reviewers to existing fap.
       *
       * @returns {typeof assignReviewersToFap}
       * @memberof Chainable
       * @example
       *    cy.assignReviewersToFap(assignReviewersToFapInput: AssignReviewersToFapMutationVariables)
       */
      assignReviewersToFap: (
        assignReviewersToFapInput: AssignReviewersToFapMutationVariables
      ) => Cypress.Chainable<AssignReviewersToFapMutation>;

      /**
       * Assign proposals to existing fap.
       *
       * @returns {typeof assignProposalsToFap}
       * @memberof Chainable
       * @example
       *    cy.assignProposalsToFaps(assignProposalsToFapInput: AssignProposalsToFapsMutationVariables)
       */
      assignProposalsToFaps: (
        assignProposalsToFapInput: AssignProposalsToFapsMutationVariables
      ) => Cypress.Chainable<AssignProposalsToFapsMutation>;

      /**
       * Assign Fap reviewers to proposal.
       *
       * @returns {typeof assignFapReviewersToProposals}
       * @memberof Chainable
       * @example
       *    cy.assignFapReviewersToProposals(assignFapReviewersToProposalsInput: AssignFapReviewersToProposalsMutationVariables)
       */
      assignFapReviewersToProposals: (
        assignFapReviewersToProposalInput: AssignFapReviewersToProposalsMutationVariables
      ) => Cypress.Chainable<AssignFapReviewersToProposalsMutation>;

      /**
       * Update proposal Fap review.
       *
       * @returns {typeof updateReview}
       * @memberof Chainable
       * @example
       *    cy.updateReview(updateReviewInput: UpdateReviewMutationVariables)
       */
      updateReview: (
        updateReviewInput: UpdateReviewMutationVariables
      ) => Cypress.Chainable<UpdateReviewMutation>;

      /**
       * Get all proposal Fap reviews.
       *
       * @returns {typeof getProposalReviews}
       * @memberof Chainable
       * @example
       *    cy.getProposalReviews(getProposalReviewsVariables: GetProposalReviewsQueryVariables)
       */
      getProposalReviews: (
        getProposalReviewsVariables: GetProposalReviewsQueryVariables
      ) => Cypress.Chainable<GetProposalReviewsQuery>;

      /**
       * Save Fap meeting decision for proposal.
       *
       * @returns {typeof saveFapMeetingDecision}
       * @memberof Chainable
       * @example
       *    cy.saveFapMeetingDecision(saveFapMeetingDecisionInput: SaveFapMeetingDecisionMutationVariables)
       */
      saveFapMeetingDecision: (
        saveFapMeetingDecisionInput: SaveFapMeetingDecisionMutationVariables
      ) => Cypress.Chainable<SaveFapMeetingDecisionMutation>;

      /**
       * Reorder FAP meeting decision proposals.
       *
       * @returns {typeof reorderFapMeetingDecisionProposals}
       * @memberof Chainable
       * @example
       *    cy.reorderFapMeetingDecisionProposals(reorderFapMeetingDecisionProposalsInput: ReorderFapMeetingDecisionProposalsMutationVariables)
       */
      reorderFapMeetingDecisionProposals: (
        reorderFapMeetingDecisionProposalsInput: ReorderFapMeetingDecisionProposalsMutationVariables
      ) => Cypress.Chainable<ReorderFapMeetingDecisionProposalsMutation>;
    }
  }
}

export {};
