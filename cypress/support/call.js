import faker from 'faker';

const createCall = ({
  shortCode,
  startDate,
  endDate,
  template,
  esiTemplate,
  workflow,
  surveyComment,
  cycleComment,
}) => {
  const callShortCode = shortCode || faker.lorem.word();
  const callStartDate =
    startDate || faker.date.past().toISOString().slice(0, 10);
  const callEndDate = endDate || faker.date.future().toISOString().slice(0, 10);
  const callSurveyComment = surveyComment || faker.lorem.word();
  const callCycleComment = cycleComment || faker.lorem.word();

  cy.contains('Calls').click();

  cy.contains('Create').click();

  cy.get('[data-cy=short-code] input')
    .type(callShortCode)
    .should('have.value', callShortCode);

  cy.get('[data-cy=start-date] input')
    .clear()
    .type(callStartDate)
    .should('have.value', callStartDate);

  cy.get('[data-cy=end-date] input')
    .clear()
    .type(callEndDate)
    .should('have.value', callEndDate);

  if (template) {
    cy.get('[data-cy="call-template"]').click();
    cy.get('[role="presentation"]').contains(template).click();
  }

  if (esiTemplate) {
    cy.get('[data-cy="call-esi-template"]').click();
    cy.get('[role="presentation"]').contains(esiTemplate).click();
  }

  if (workflow) {
    cy.get('#proposalWorkflowId-input').click();

    cy.contains('Loading...').should('not.exist');

    cy.get('[role="presentation"]').contains(workflow).click();
  }

  cy.get('[data-cy="next-step"]').click();

  cy.get('[data-cy=survey-comment] input').clear().type(callSurveyComment);

  cy.get('[data-cy="next-step"]').click();

  cy.get('[data-cy=cycle-comment] input').clear().type(callCycleComment);

  cy.get('[data-cy="submit"]').click();

  cy.notification({ variant: 'success', text: 'successfully' });

  cy.contains(callShortCode);
};

Cypress.Commands.add('createCall', createCall);
