import {
  AddStatusChangingEventsToConnectionMutationVariables,
  AddStatusChangingEventsToConnectionMutation,
  CreateProposalWorkflowMutationVariables,
  CreateProposalWorkflowMutation,
  CreateProposalStatusMutationVariables,
  CreateProposalStatusMutation,
  AddProposalWorkflowStatusMutationVariables,
  AddProposalWorkflowStatusMutation,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates new proposal workflow with name and description passed.
       *
       * @returns {typeof createProposalWorkflow}
       * @memberof Chainable
       * @example
       *    cy.createProposalWorkflow('Workflow name', 'Workflow description')
       */
      createProposalWorkflow: (
        createProposalWorkflowInput: CreateProposalWorkflowMutationVariables
      ) => Cypress.Chainable<CreateProposalWorkflowMutation>;

      /**
       * Creates new proposal status.
       *
       * @returns {typeof createProposalStatus}
       * @memberof Chainable
       * @example
       *    cy.createProposalStatus(createProposalStatusInput: CreateProposalStatusMutationVariables)
       */
      createProposalStatus: (
        createProposalStatusInput: CreateProposalStatusMutationVariables
      ) => Cypress.Chainable<CreateProposalStatusMutation>;

      /**
       * Adds status changing event/s to status. When those event/s are fired the the status will be changed to statusCode you pass.
       *
       * @returns {typeof addStatusChangingEventsToConnection}
       * @memberof Chainable
       * @example
       *    cy.addStatusChangingEventsToConnection('FEASIBILITY_REVIEW', ['PROPOSAL_SUBMITTED'])
       */
      addStatusChangingEventsToConnection: (
        addStatusChangingEventsToConnectionInput: AddStatusChangingEventsToConnectionMutationVariables
      ) => Cypress.Chainable<AddStatusChangingEventsToConnectionMutation>;

      /**
       * Add proposal status to workflow.
       *
       * @returns {typeof addProposalWorkflowStatus}
       * @memberof Chainable
       * @example
       *    cy.addProposalWorkflowStatus(addProposalWorkflowStatusInput: AddProposalWorkflowStatusMutationVariables)
       */
      addProposalWorkflowStatus: (
        addProposalWorkflowStatusInput: AddProposalWorkflowStatusMutationVariables
      ) => Cypress.Chainable<AddProposalWorkflowStatusMutation>;
    }
  }
}

export {};
