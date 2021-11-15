import {
  AddStatusChangingEventsToConnectionMutationVariables,
  CreateProposalWorkflowMutationVariables,
  CreateProposalWorkflowMutation,
} from '../../src/generated/sdk';

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
      ) => Promise<CreateProposalWorkflowMutation>;

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
      ) => void;
    }
  }
}

export {};
