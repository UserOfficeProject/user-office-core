import {
  SetStatusChangingEventsOnConnectionMutationVariables,
  SetStatusChangingEventsOnConnectionMutation,
  CreateWorkflowMutationVariables,
  CreateWorkflowMutation,
  CreateStatusMutationVariables,
  CreateStatusMutation,
  AddWorkflowStatusMutation,
  AddConnectionStatusActionsMutation,
  AddStatusToWorkflowMutation,
  AddConnectionStatusActionsMutationVariables,
  AddStatusToWorkflowMutationVariables,
  Status,
  CreateWorkflowConnectionMutation,
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
       * @returns {typeof setStatusChangingEventsOnConnection}
       * @memberof Chainable
       * @example
       *    cy.setStatusChangingEventsOnConnection('FEASIBILITY_REVIEW', ['PROPOSAL_SUBMITTED'])
       */
      setStatusChangingEventsOnConnection: (
        setStatusChangingEventsOnConnectionInput: SetStatusChangingEventsOnConnectionMutationVariables
      ) => Cypress.Chainable<SetStatusChangingEventsOnConnectionMutation>;

      /**
       * Add proposal status to workflow and optionally create connection from previous status.
       *
       * @returns {typeof addStatusToWorkflow}
       * @memberof Chainable
       * @example
       *    cy.addStatusToWorkflow(addStatusToWorkflowInput: AddStatusToWorkflowMutationVariables)
       */
      addStatusToWorkflow: (
        addStatusToWorkflowInput: Omit<
          AddStatusToWorkflowMutationVariables,
          'posX' | 'posY'
        > & {
          prevId?: number;
          posX?: number;
          posY?: number;
        }
      ) => Cypress.Chainable<
        AddStatusToWorkflowMutation & CreateWorkflowConnectionMutation
      >;
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
       * Drags a status element into the workflow canvas area
       * @param sourceSelector - Status object representing the status to be dragged
       * @param options - Additional options for the drag operation
       * @example
       * cy.dragStatusIntoWorkflow(initialDBData.proposalStatuses.draft, { clientX: 100, clientY: 200 });
       */
      dragStatusIntoWorkflow(
        sourceSelector: Pick<Status, 'id'>,
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
        sourceStatus: Pick<Status, 'id'>,
        targetStatus: Pick<Status, 'id'>,
        options?: {
          force?: boolean;
        }
      ): Chainable<Element>;
    }
  }
}

export {};
