import {
  AddStatusToWorkflowMutation,
  AddStatusToWorkflowMutationVariables,
  CreateStatusMutation,
  CreateStatusMutationVariables,
  CreateWorkflowConnectionMutation,
  CreateWorkflowMutation,
  CreateWorkflowMutationVariables,
  SetStatusActionsOnConnectionInput,
  SetStatusActionsOnConnectionMutation,
  SetStatusChangingEventsOnConnectionMutation,
  SetStatusChangingEventsOnConnectionMutationVariables,
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

const addStatusToWorkflow = (
  addStatusToWorkflowInput: Omit<
    AddStatusToWorkflowMutationVariables,
    'posX' | 'posY'
  > & {
    prevId?: number;
    posX?: number;
    posY?: number;
  }
): Cypress.Chainable<
  AddStatusToWorkflowMutation & CreateWorkflowConnectionMutation
> => {
  const api = getE2EApi();

  return cy
    .wrap(null)
    .then<AddStatusToWorkflowMutation>(() =>
      api.addStatusToWorkflow({
        ...addStatusToWorkflowInput,
        posX: addStatusToWorkflowInput.posX ?? 0,
        posY: addStatusToWorkflowInput.posY ?? 0,
      })
    )
    .then<AddStatusToWorkflowMutation & CreateWorkflowConnectionMutation>(
      (request) => {
        if (!addStatusToWorkflowInput.prevId) {
          const emptyConnection = {
            createWorkflowConnection: null,
          } as unknown as CreateWorkflowConnectionMutation;

          return Promise.resolve({ ...request, ...emptyConnection });
        }

        return api
          .createWorkflowConnection({
            newWorkflowConnectionInput: {
              nextWorkflowStatusId:
                request.addStatusToWorkflow.workflowStatusId,
              prevWorkflowStatusId: addStatusToWorkflowInput.prevId,
              sourceHandle: 'bottom-source',
              targetHandle: 'top-target',
            },
          })
          .then((request2) => ({ ...request, ...request2 }));
      }
    );
};

const setStatusChangingEventsOnConnection = (
  setStatusChangingEventsOnConnectionInput: SetStatusChangingEventsOnConnectionMutationVariables
): Cypress.Chainable<SetStatusChangingEventsOnConnectionMutation> => {
  const api = getE2EApi();
  const request = api.setStatusChangingEventsOnConnection(
    setStatusChangingEventsOnConnectionInput
  );

  return cy.wrap(request);
};

const addConnectionStatusActions = (
  setStatusActionsOnConnectionInput: SetStatusActionsOnConnectionInput
): Cypress.Chainable<SetStatusActionsOnConnectionMutation> => {
  const api = getE2EApi();
  const request = api.setStatusActionsOnConnection(
    setStatusActionsOnConnectionInput
  );

  return cy.wrap(request);
};

const addFeasibilityReviewToDefaultWorkflow = (): Cypress.Chainable<
  AddStatusToWorkflowMutation & CreateWorkflowConnectionMutation
> => {
  return cy.addStatusToWorkflow({
    statusId: initialDBData.proposalStatuses.feasibilityReview.id,
    workflowId: initialDBData.workflows.defaultWorkflow.id,
    prevId: 1,
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
  status: Pick<Status, 'id'>,
  options: {
    clientX?: number;
    clientY?: number;
  } = {}
) {
  const { clientX = 500, clientY = 300 } = options;

  const sourceSelector = `[data-cy="status_${status.id}"]`;
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
  sourceStatus: { id: number },
  targetStatus: { id: number },
  options?: {
    force?: boolean;
  }
) {
  const sourceNodeSelector = `[data-cy="connection_${sourceStatus.id}"] [data-handlepos="bottom"]`;
  const targetNodeSelector = `[data-cy="connection_${targetStatus.id}"] [data-handlepos="top"]`;
  cy.get(sourceNodeSelector).click(options);
  cy.get(targetNodeSelector).click(options);
}

Cypress.Commands.add('createWorkflow', createWorkflow);
Cypress.Commands.add('createStatus', createStatus);
Cypress.Commands.add('addStatusToWorkflow', addStatusToWorkflow);
Cypress.Commands.add(
  'setStatusChangingEventsOnConnection',
  setStatusChangingEventsOnConnection
);
Cypress.Commands.add('addConnectionStatusActions', addConnectionStatusActions);
Cypress.Commands.add(
  'addFeasibilityReviewToDefaultWorkflow',
  addFeasibilityReviewToDefaultWorkflow
);
Cypress.Commands.add('dragStatusIntoWorkflow', dragStatusIntoWorkflow);
Cypress.Commands.add('connectReactFlowNodes', connectReactFlowNodes);
