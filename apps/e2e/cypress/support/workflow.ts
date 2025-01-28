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
      droppableGroupId: 'proposalWorkflowConnections_0',
      statusId: initialDBData.proposalStatuses.feasibilityReview.id,
      workflowId: 1,
      sortOrder: 1,
      prevStatusId: 1,
    });
  };

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
