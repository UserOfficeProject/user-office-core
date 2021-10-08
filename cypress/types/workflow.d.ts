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
        workflowName: string,
        workflowDescription: string
      ) => void;

      /**
       * Adds status changing event/s to status. When those event/s are fired the the status will be changed to statusCode you pass.
       *
       * @returns {typeof addProposalStatusChangingEventToStatus}
       * @memberof Chainable
       * @example
       *    cy.addProposalStatusChangingEventToStatus('FEASIBILITY_REVIEW', ['PROPOSAL_SUBMITTED'])
       */
      addProposalStatusChangingEventToStatus: (
        statusCode: string,
        statusChangingEvents: string[]
      ) => void;
    }
  }
}

export {};
