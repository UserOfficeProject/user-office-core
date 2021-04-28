const createProposalWorkflow = (workflowName, workflowDescription) => {
  cy.contains('Proposal workflows').click();
  cy.contains('Create').click();

  cy.get('#name').type(workflowName);
  cy.get('#description').type(workflowDescription);
  cy.get('[data-cy="submit"]').click();

  cy.notification({ variant: 'success', text: 'created successfully' });
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
