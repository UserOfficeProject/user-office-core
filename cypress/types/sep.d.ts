import {
  AssignChairOrSecretaryMutation,
  AssignChairOrSecretaryMutationVariables,
  CreateSepMutation,
  CreateSepMutationVariables,
  AssignReviewersToSepMutationVariables,
  AssignReviewersToSepMutation,
  AssignProposalsToSepMutation,
  AssignProposalsToSepMutationVariables,
  AssignSepReviewersToProposalMutationVariables,
  AssignSepReviewersToProposalMutation,
  SaveSepMeetingDecisionMutationVariables,
  SaveSepMeetingDecisionMutation,
} from '../../src/generated/sdk';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates new sep with values passed.
       *
       * @returns {typeof createSep}
       * @memberof Chainable
       * @example
       *    cy.createSep(newSepInput: CreateSepMutationVariables)
       */
      createSep: (
        newSepInput: CreateSepMutationVariables
      ) => Cypress.Chainable<CreateSepMutation>;

      /**
       * Assign chair or secretary to existing sep.
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
       * Assign reviewers to existing sep.
       *
       * @returns {typeof assignReviewersToSep}
       * @memberof Chainable
       * @example
       *    cy.assignReviewersToSep(assignReviewersToSepInput: AssignReviewersToSepMutationVariables)
       */
      assignReviewersToSep: (
        assignReviewersToSepInput: AssignReviewersToSepMutationVariables
      ) => Cypress.Chainable<AssignReviewersToSepMutation>;

      /**
       * Assign proposals to existing sep.
       *
       * @returns {typeof assignProposalsToSep}
       * @memberof Chainable
       * @example
       *    cy.assignProposalsToSep(assignProposalsToSepInput: AssignProposalsToSepMutationVariables)
       */
      assignProposalsToSep: (
        assignProposalsToSepInput: AssignProposalsToSepMutationVariables
      ) => Cypress.Chainable<AssignProposalsToSepMutation>;

      /**
       * Assign SEP reviewers to proposal.
       *
       * @returns {typeof assignSepReviewersToProposal}
       * @memberof Chainable
       * @example
       *    cy.assignSepReviewersToProposal(assignSepReviewersToProposalInput: AssignSepReviewersToProposalMutationVariables)
       */
      assignSepReviewersToProposal: (
        assignSepReviewersToProposalInput: AssignSepReviewersToProposalMutationVariables
      ) => Cypress.Chainable<AssignSepReviewersToProposalMutation>;

      /**
       * Save SEP meeting decision for proposal.
       *
       * @returns {typeof saveSepMeetingDecision}
       * @memberof Chainable
       * @example
       *    cy.saveSepMeetingDecision(saveSepMeetingDecisionInput: SaveSepMeetingDecisionMutationVariables)
       */
      saveSepMeetingDecision: (
        saveSepMeetingDecisionInput: SaveSepMeetingDecisionMutationVariables
      ) => Cypress.Chainable<SaveSepMeetingDecisionMutation>;
    }
  }
}

export {};
