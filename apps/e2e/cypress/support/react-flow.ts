/**
 * ReactFlow drag-and-drop utilities for Cypress tests
 */

import { Status } from '@user-office-software-libs/shared-types';

/**
 * Creates a proper DataTransfer mock that stores and returns data like the real browser API
 */
function createDataTransferMock() {
  return {
    _data: new Map<string, string>(),
    setData: function (format: string, data: string) {
      this._data.set(format, data);
    },
    getData: function (format: string) {
      return this._data.get(format) || '';
    },
    effectAllowed: 'move' as const,
  };
}

/**
 * Simulates dragging a ReactFlow status element to a drop target
 * @param sourceSelector - Cypress selector for the draggable element
 * @param targetSelector - Cypress selector for the drop target
 * @param statusId - The status ID to be transferred via DataTransfer
 * @param options - Additional options for the drag operation
 */

function addStatusToWorkflow(
  status: Pick<Status, 'name' | 'id'>,
  options: {
    clientX?: number;
    clientY?: number;
  } = {}
) {
  const { clientX = 500, clientY = 300 } = options;

  const sourceSelector = `[data-cy="status_${status.name}"]`;
  const targetSelector = '[data-testid="rf__background"]';
  cy.get(sourceSelector).then(($element) => {
    const sourceElement = $element[0];

    // Create a mock DataTransfer that stores data like the real one
    const mockDataTransfer = createDataTransferMock();

    // Trigger dragstart with the proper mock
    cy.wrap(sourceElement).trigger('dragstart', {
      dataTransfer: mockDataTransfer,
      force: true,
    });

    // Set the status ID data as the real component would
    mockDataTransfer.setData('application/reactflow', status.id.toString());

    // Trigger dragover and drop on the target
    cy.get(targetSelector).trigger('dragover', {
      dataTransfer: mockDataTransfer,
      force: true,
    });

    cy.get(targetSelector).trigger('drop', {
      dataTransfer: mockDataTransfer,
      clientX,
      clientY,
      force: true,
    });
  });
}

/**
 * Simulates connecting two ReactFlow nodes by dragging from source handle to target handle
 * @param sourceNodeSelector - Cypress selector for the source node connection handle
 * @param targetNodeSelector - Cypress selector for the target node connection handle
 * @param options - Additional options for the connection operation
 */
function connectReactFlowNodes(
  sourceStatus: Pick<Status, 'name'>,
  targetStatus: Pick<Status, 'name'>,
  options?: {
    force?: boolean;
  }
) {
  const sourceNodeSelector = `[data-cy="connection_${sourceStatus.name}"] [data-handlepos="bottom"]`;
  const targetNodeSelector = `[data-cy="connection_${targetStatus.name}"] [data-handlepos="top"]`;
  cy.get(sourceNodeSelector).click(options);
  cy.get(targetNodeSelector).click(options);
}

// Add the command to Cypress - using type assertion to bypass TypeScript compilation issue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Cypress.Commands as any).add('addReactFlowStatus', addStatusToWorkflow);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Cypress.Commands as any).add('connectReactFlowNodes', connectReactFlowNodes);
