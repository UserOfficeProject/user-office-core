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

const createProposalWorkflow = (
  createProposalWorkflowInput: CreateWorkflowMutationVariables
): Cypress.Chainable<CreateWorkflowMutation> => {
  const api = getE2EApi();
  const request = api.createWorkflow(createProposalWorkflowInput);

  return cy.wrap(request);
};

const createProposalStatus = (
  createProposalStatusInput: CreateStatusMutationVariables
): Cypress.Chainable<CreateStatusMutation> => {
  const api = getE2EApi();
  const request = api.createStatus(createProposalStatusInput);

  return cy.wrap(request);
};

const addProposalWorkflowStatus = (
  addProposalWorkflowStatusInput: AddWorkflowStatusMutationVariables
): Cypress.Chainable<AddWorkflowStatusMutation> => {
  const api = getE2EApi();
  const request = api.addWorkflowStatus(addProposalWorkflowStatusInput);

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
    return cy.addProposalWorkflowStatus({
      droppableGroupId: 'proposalWorkflowConnections_0',
      proposalStatusId: initialDBData.proposalStatuses.feasibilityReview.id,
      proposalWorkflowId: 1,
      sortOrder: 1,
      prevStatusId: 1,
    });
  };

Cypress.Commands.add('createProposalWorkflow', createProposalWorkflow);
Cypress.Commands.add('createProposalStatus', createProposalStatus);
Cypress.Commands.add('addProposalWorkflowStatus', addProposalWorkflowStatus);
Cypress.Commands.add(
  'addStatusChangingEventsToConnection',
  addStatusChangingEventsToConnection
);
Cypress.Commands.add('addConnectionStatusActions', addConnectionStatusActions);
Cypress.Commands.add(
  'addFeasibilityReviewToDefaultWorkflow',
  addFeasibilityReviewToDefaultWorkflow
);
