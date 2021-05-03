import faker from 'faker';

const createCall = ({
  shortCode,
  startDate,
  endDate,
  template,
  workflow,
  surveyComment,
  cycleComment,
}) => {
  const callShortCode = shortCode || faker.random.word().split(' ')[0]; // faker random word is buggy, it ofter returns phrases
  const callStartDate =
    startDate || faker.date.past().toISOString().slice(0, 10);
  const callEndDate = endDate || faker.date.future().toISOString().slice(0, 10);
  const callSurveyComment = surveyComment || faker.random.word().split(' ')[0];
  const callCycleComment = cycleComment || faker.random.word().split(' ')[0];

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
    cy.contains(template).click();
  }

  if (workflow) {
    cy.get('#mui-component-select-proposalWorkflowId').click();

    cy.contains('Loading...').should('not.exist');

    cy.contains(workflow).click();
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
