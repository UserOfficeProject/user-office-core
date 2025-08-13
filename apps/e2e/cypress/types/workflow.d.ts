import {
  AddStatusChangingEventsToConnectionMutationVariables,
  AddStatusChangingEventsToConnectionMutation,
  CreateWorkflowMutationVariables,
  CreateWorkflowMutation,
  CreateStatusMutationVariables,
  CreateStatusMutation,
  AddWorkflowStatusMutationVariables,
  AddWorkflowStatusMutation,
  AddConnectionStatusActionsMutation,
  AddConnectionStatusActionsMutationVariables,
  Status,
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
       *    cy.createWorkflow('Workflow name', 'Workflow description')
       */
      createWorkflow: (
        createWorkflowInput: CreateWorkflowMutationVariables
      ) => Cypress.Chainable<CreateWorkflowMutation>;

      /**
       * Creates new proposal status.
       *
       * @returns {typeof createProposalStatus}
       * @memberof Chainable
       * @example
       *    cy.createStatus(createProposalStatusInput: CreateStatusMutationVariables)
       */
      createStatus: (
        createStatusInput: CreateStatusMutationVariables
      ) => Cypress.Chainable<CreateStatusMutation>;

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
       * @returns {typeof addWorkflowStatus}
       * @memberof Chainable
       * @example
       *    cy.addWorkflowStatus(addWorkflowStatusInput: AddWorkflowStatusMutationVariables)
       */
      addWorkflowStatus: (
        addWorkflowStatusInput: AddWorkflowStatusMutationVariables
      ) => Cypress.Chainable<AddWorkflowStatusMutation>;
      /**
       * Add proposal status action to workflow connection.
       *
       * @returns {typeof addConnectionStatusActions}
       * @memberof Chainable
       * @example
       *    cy.addConnectionStatusActions(addConnectionStatusActionsInput: AddConnectionStatusActionsMutationVariables)
       */
      addConnectionStatusActions: (
        addConnectionStatusActionsInput: AddConnectionStatusActionsMutationVariables
      ) => Cypress.Chainable<AddConnectionStatusActionsMutation>;

      /**
       * Add feasibility review to default workflow.
       *
       * @returns {typeof AddWorkflowStatusMutation}
       * @memberof Chainable
       * @example
       *    cy.addFeasibilityReviewToDefaultWorkflow()
       */
      addFeasibilityReviewToDefaultWorkflow: () => Cypress.Chainable<AddWorkflowStatusMutation>;

      /**
       * Simulates dragging a ReactFlow status element to a drop target
       * @param sourceSelector - Cypress selector for the draggable element
       * @param targetSelector - Cypress selector for the drop target
       * @param statusId - The status ID to be transferred via DataTransfer
       * @param options - Additional options for the drag operation
       * @example
       * cy.dragReactFlowStatus(
       *   '[data-cy^="status_FEASIBILITY_REVIEW"]',
       *   '[data-testid="rf__background"]',
       *   initialDBData.proposalStatuses.feasibilityReview.id
       * );
       */
      dragStatusIntoWorkflow(
        sourceSelector: Pick<Status, 'shortCode' | 'id'>,
        options?: {
          clientX?: number;
          clientY?: number;
          dataFormat?: string;
        }
      ): Chainable<Element>;

      /**
       * Simulates connecting two ReactFlow nodes by dragging from source handle to target handle
       * @param sourceStatus - Status object representing the source node
       * @param targetStatus - Status object representing the target node
       * @param options - Additional options for the connection operation
       * @example
       * cy.connectReactFlowNodes(
       *   initialDBData.proposalStatuses.draft,
       *   initialDBData.proposalStatuses.feasibilityReview
       * );
       */
      connectReactFlowNodes(
        sourceStatus: Pick<Status, 'shortCode'>,
        targetStatus: Pick<Status, 'shortCode'>,
        options?: {
          force?: boolean;
        }
      ): Chainable<Element>;
    }
  }
}

export {};
