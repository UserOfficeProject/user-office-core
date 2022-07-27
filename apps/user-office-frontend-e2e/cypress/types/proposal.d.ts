import {
  CreateProposalMutationVariables,
  UpdateProposalMutationVariables,
  AdministrationProposalMutationVariables,
  ChangeProposalsStatusMutation,
  UpdateProposalMutation,
  AdministrationProposalMutation,
  CreateProposalMutation,
  ChangeProposalsStatusMutationVariables,
  SubmitProposalMutationVariables,
  SubmitProposalMutation,
  UpdateEsiMutationVariables,
  UpdateEsiMutation,
  CreateEsiMutationVariables,
  CreateEsiMutation,
  CloneProposalsMutationVariables,
  CloneProposalsMutation,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates new proposal with title and abstract passed. If nothing is passed it generates title and abstract on its own. You need to be logged in as a user.
       *
       * @returns {typeof createProposal}
       * @memberof Chainable
       * @example
       *    cy.createProposal(createProposalInput: CreateProposalMutationVariables)
       */
      createProposal: (
        createProposalInput: CreateProposalMutationVariables
      ) => Cypress.Chainable<CreateProposalMutation>;

      /**
       * Updates proposal
       *
       * @returns {typeof updateProposal}
       * @memberof Chainable
       * @example
       *    cy.updateProposal(updateProposalInput: UpdateProposalMutationVariables)
       */
      updateProposal: (
        updateProposalInput: UpdateProposalMutationVariables
      ) => Cypress.Chainable<UpdateProposalMutation>;

      /**
       * Submit proposal
       *
       * @returns {typeof submitProposal}
       * @memberof Chainable
       * @example
       *    cy.submitProposal(submitProposalInput: SubmitProposalMutationVariables)
       */
      submitProposal: (
        submitProposalInput: SubmitProposalMutationVariables
      ) => Cypress.Chainable<SubmitProposalMutation>;

      /**
       * Clone proposals
       *
       * @returns {typeof cloneProposals}
       * @memberof Chainable
       * @example
       *    cy.cloneProposals(cloneProposalsInput: CloneProposalsMutationVariables)
       */
      cloneProposals: (
        cloneProposalsInput: CloneProposalsMutationVariables
      ) => Cypress.Chainable<CloneProposalsMutation>;

      /**
       * Change of the proposal status by name with status name passed as second parameter.
       * If no proposalTitle is passed it selects all proposals.
       *
       * @returns {typeof changeProposalStatus}
       * @memberof Chainable
       * @example
       *    cy.changeProposalStatus(changeProposalStatusInput: ChangeProposalsStatusInput)
       */
      changeProposalsStatus: (
        changeProposalStatusInput: ChangeProposalsStatusMutationVariables
      ) => Cypress.Chainable<ChangeProposalsStatusMutation>;

      /**
       * Allocates time for the proposal and optionally submits
       * management decision
       *
       * @returns {typeof updateProposalManagementDecision}
       * @memberof Chainable
       * @example
       *        cy.updateProposalManagementDecision(administrationProposalInput: AdministrationProposalMutationVariables);
       */
      updateProposalManagementDecision: (
        administrationProposalInput: AdministrationProposalMutationVariables
      ) => Cypress.Chainable<AdministrationProposalMutation>;

      /**
       * Update proposal ESI.
       *
       * @returns {typeof updateEsi}
       * @memberof Chainable
       * @example
       *        cy.updateEsi(updateEsiInput: UpdateEsiMutationVariables);
       */
      updateEsi: (
        updateEsiInput: UpdateEsiMutationVariables
      ) => Cypress.Chainable<UpdateEsiMutation>;

      /**
       * Create proposal ESI.
       *
       * @returns {typeof createEsi}
       * @memberof Chainable
       * @example
       *        cy.createEsi(createEsiInput: CreateEsiMutationVariables);
       */
      createEsi: (
        createEsiInput: CreateEsiMutationVariables
      ) => Cypress.Chainable<CreateEsiMutation>;
    }
  }
}

export {};
