import { GraphQLClient } from 'graphql-request';

const createProposalWorkflow = (workflowName, workflowDescription) => {
  const query = `mutation {
    createProposalWorkflow(newProposalWorkflowInput: {
      name: "${workflowName}",
      description: "${workflowDescription}"
    }) {
      rejection {
        reason
      }
      proposalWorkflow {
        id
      }
    }
  }`;
  const authHeader = `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`;
  const request = new GraphQLClient('/gateway', {
    headers: { authorization: authHeader },
  }).rawRequest(query, null);

  cy.wrap(request);
};

const addProposalStatusChangingEventToStatus = (
  statusCode,
  statusChangingEvents
) => {
  cy.get(`[data-cy^="connection_${statusCode}"]`).click();

  cy.get('[data-cy="status-changing-events-modal"]').should('exist');

  statusChangingEvents.forEach((statusChangingEvent) => {
    cy.contains(statusChangingEvent).click();
  });

  cy.get('[data-cy="submit"]').click();

  cy.notification({
    variant: 'success',
    text: 'Status changing events added successfully!',
  });

  statusChangingEvents.forEach((statusChangingEvent) => {
    cy.contains(statusChangingEvent);
  });
};

Cypress.Commands.add(
  'addProposalStatusChangingEventToStatus',
  addProposalStatusChangingEventToStatus
);
Cypress.Commands.add('createProposalWorkflow', createProposalWorkflow);
