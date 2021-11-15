import {
  AddStatusChangingEventsToConnectionMutationVariables,
  CreateProposalWorkflowMutationVariables,
} from '../../src/generated/sdk';
import { getE2EApi } from './utils';

const createProposalWorkflow = (
  createProposalWorkflowInput: CreateProposalWorkflowMutationVariables
) => {
  const api = getE2EApi();
  const request = api.createProposalWorkflow(createProposalWorkflowInput);

  cy.wrap(request);
};

const addStatusChangingEventsToConnection = (
  addStatusChangingEventsToConnectionInput: AddStatusChangingEventsToConnectionMutationVariables
) => {
  const api = getE2EApi();
  const request = api.addStatusChangingEventsToConnection(
    addStatusChangingEventsToConnectionInput
  );

  cy.wrap(request);
  // cy.get(`[data-cy^="connection_${statusCode}"]`).click();

  // cy.get('[data-cy="status-changing-events-modal"]').should('exist');

  // statusChangingEvents.forEach((statusChangingEvent) => {
  //   cy.contains(statusChangingEvent).click();
  // });

  // cy.get('[data-cy="submit"]').click();

  // cy.notification({
  //   variant: 'success',
  //   text: 'Status changing events added successfully!',
  // });

  // statusChangingEvents.forEach((statusChangingEvent) => {
  //   cy.contains(statusChangingEvent);
  // });
};

Cypress.Commands.add('createProposalWorkflow', createProposalWorkflow);
Cypress.Commands.add(
  'addStatusChangingEventsToConnection',
  addStatusChangingEventsToConnection
);
