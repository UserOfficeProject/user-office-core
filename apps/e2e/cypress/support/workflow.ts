import {
  AddConnectionStatusActionsMutation,
  AddConnectionStatusActionsMutationVariables,
  AddWorkflowStatusMutation,
  AddWorkflowStatusMutationVariables,
  AddStatusChangingEventsToConnectionMutation,
  AddStatusChangingEventsToConnectionMutationVariables,
  CreateStatusMutation,
  CreateStatusMutationVariables,
  CreateWorkflowMutation,
  CreateWorkflowMutationVariables,
  Status,
} from '@user-office-software-libs/shared-types';

import initialDBData from './initialDBData';
import { getE2EApi } from './utils';

const createWorkflow = (
  createWorkflowInput: CreateWorkflowMutationVariables
): Cypress.Chainable<CreateWorkflowMutation> => {
  const api = getE2EApi();
  const request = api.createWorkflow(createWorkflowInput);

  return cy.wrap(request);
};

const createStatus = (
  createStatusInput: CreateStatusMutationVariables
): Cypress.Chainable<CreateStatusMutation> => {
  const api = getE2EApi();
  const request = api.createStatus(createStatusInput);

  return cy.wrap(request);
};

const addWorkflowStatus = (
  addWorkflowStatusInput: AddWorkflowStatusMutationVariables
): Cypress.Chainable<AddWorkflowStatusMutation> => {
  const api = getE2EApi();
  const request = api.addWorkflowStatus(addWorkflowStatusInput);

  return cy.wrap(request);
};

const addStatusChangingEventsToConnection = (
  addStatusChangingEventsToConnectionInput: AddStatusChangingEventsToConnectionMutationVariables
): Cypress.Chainable<AddStatusChangingEventsToConnectionMutation> => {
  const api = getE2EApi();
  const request = api.addStatusChangingEventsToConnection(
    addStatusChangingEventsToConnectionInput
  );

  return cy.wrap(request);
};

const addConnectionStatusActions = (
  addStatusActionToConnectionInput: AddConnectionStatusActionsMutationVariables
): Cypress.Chainable<AddConnectionStatusActionsMutation> => {
  const api = getE2EApi();
  const request = api.addConnectionStatusActions(
    addStatusActionToConnectionInput
  );

  return cy.wrap(request);
};

const addFeasibilityReviewToDefaultWorkflow =
  (): Cypress.Chainable<AddWorkflowStatusMutation> => {
    return cy.addWorkflowStatus({
      statusId: initialDBData.proposalStatuses.feasibilityReview.id,
      workflowId: 1,
      sortOrder: 1,
      prevStatusId: 1,
      posX: 0,
      posY: 200,
    });
  };
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

function dragStatusIntoWorkflow(
  status: Pick<Status, 'shortCode' | 'id'>,
  options: {
    clientX?: number;
    clientY?: number;
  } = {}
) {
  const { clientX = 500, clientY = 300 } = options;

  const sourceSelector = `[data-cy="status_${status.shortCode}"]`;
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
  sourceStatus: Pick<Status, 'shortCode'>,
  targetStatus: Pick<Status, 'shortCode'>,
  options?: {
    force?: boolean;
  }
) {
  const sourceNodeSelector = `[data-cy="connection_${sourceStatus.shortCode}"] [data-handlepos="bottom"]`;
  const targetNodeSelector = `[data-cy="connection_${targetStatus.shortCode}"] [data-handlepos="top"]`;
  cy.get(sourceNodeSelector).click(options);
  cy.get(targetNodeSelector).click(options);
}

Cypress.Commands.add('createWorkflow', createWorkflow);
Cypress.Commands.add('createStatus', createStatus);
Cypress.Commands.add('addWorkflowStatus', addWorkflowStatus);
Cypress.Commands.add(
  'addStatusChangingEventsToConnection',
  addStatusChangingEventsToConnection
);
Cypress.Commands.add('addConnectionStatusActions', addConnectionStatusActions);
Cypress.Commands.add(
  'addFeasibilityReviewToDefaultWorkflow',
  addFeasibilityReviewToDefaultWorkflow
);
Cypress.Commands.add('dragStatusIntoWorkflow', dragStatusIntoWorkflow);
Cypress.Commands.add('connectReactFlowNodes', connectReactFlowNodes);
