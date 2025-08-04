import { Status } from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
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
      addReactFlowStatus(
        sourceSelector: Pick<Status, 'name' | 'id'>,
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
        sourceStatus: Pick<Status, 'name'>,
        targetStatus: Pick<Status, 'name'>,
        options?: {
          force?: boolean;
        }
      ): Chainable<Element>;
    }
  }
}

export {};
