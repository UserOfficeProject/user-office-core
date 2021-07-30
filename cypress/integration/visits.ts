import faker from 'faker';

faker.seed(1);

context('visits tests', () => {
  before(() => {
    // reset data and add seeds with test proposal
    cy.resetDB(true);
    cy.resetSchedulerDB(true);
    // Add co-proposer
    cy.login('officer');
    cy.contains('999999').parent().find('[title="View proposal"]').click();
    cy.get('[data-cy=toggle-edit-proposal]').click();
    cy.get('[data-cy=questionary-stepper]').contains('New proposal').click();
    cy.get('[data-cy=add-participant-button]').click();
    cy.contains('Benjamin').parent().find('[type=checkbox]').click();
    cy.get('[data-cy=assign-selected-users]').click();
    cy.get('[data-cy=co-proposers]').contains('Benjamin'); // make sure Benjamin was added
    cy.get('[data-cy=save-and-continue-button]').click();
    // allocate time for the test proposal
    cy.get('[role="dialog"]').contains('Admin').click();
    cy.get('#mui-component-select-finalStatus').click();
    cy.get('[role="listbox"]').contains('Accepted').click();
    cy.get('[data-cy="is-management-decision-submitted"]').click();
    cy.get('[data-cy="save-admin-decision"]').click();
    cy.closeModal();
    cy.logout();
    const eventDate = faker.date.future().toISOString().split('T')[0];
    cy.createScheduledEvent(1, {
      startsAt: `${eventDate} 10:00`,
      endsAt: `${eventDate} 11:00`,
    });
    cy.activateBooking(1);
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('/');
  });

  const visitTemplateName = faker.lorem.words(2);
  const visitTemplateDescription = faker.lorem.words(3);

  const startDateQuestionTitle = 'Visit start';
  const endDateQuestionTitle = 'Visit end';

  const formTeamTitle = 'Define who is coming';
  const registerVisitTitle = 'Define your own visit';
  const individualTrainingTitle = 'Finish individual training';
  const declareShipmentTitle = 'Declare shipment(s)';

  it('Should be able to create visits template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Visit templates');

    cy.get('[data-cy=create-new-button]').click();

    cy.get('[data-cy=name] input')
      .type(visitTemplateName)
      .should('have.value', visitTemplateName);

    cy.get('[data-cy=description]').type(visitTemplateDescription);

    cy.get('[data-cy=submit]').click();

    cy.contains('New visit');

    cy.createDateQuestion(startDateQuestionTitle);
    cy.createDateQuestion(endDateQuestionTitle);
  });

  it('PI should see that he is able to form team', () => {
    cy.login({ email: 'Javon4@hotmail.com', password: 'Test1234!' });

    cy.contains(/Upcoming experiments/i).should('exist');

    cy.testActionButton(formTeamTitle, 'active');
    cy.testActionButton(registerVisitTitle, 'inactive');
    cy.testActionButton(individualTrainingTitle, 'inactive');
    cy.testActionButton(declareShipmentTitle, 'inactive');
  });

  it('Non-visitor should not see upcoming events', () => {
    cy.login({ email: 'david@teleworm.us', password: 'Test1234!' });

    cy.contains(/Upcoming experiments/i).should('not.exist');
  });

  it('Co-proposer should be able to form team', () => {
    cy.login({ email: 'ben@inbox.com', password: 'Test1234!' });

    cy.contains(/Upcoming experiments/i).should('exist');

    // test that that actions has correct state
    cy.testActionButton(formTeamTitle, 'active');
    cy.testActionButton(registerVisitTitle, 'inactive');
    cy.testActionButton(individualTrainingTitle, 'inactive');
    cy.testActionButton(declareShipmentTitle, 'inactive');

    // create visit
    cy.get(`[title="${formTeamTitle}"]`).click();

    // test error messages
    cy.get('[type="submit"]').click();
    cy.contains(/Please add visitors/i);
    cy.contains(/Please select the team lead/i);

    // add visitors
    cy.get('[data-cy=add-participant-button]').click();
    cy.contains('Beckley').parent().find('[type=checkbox]').click();
    cy.contains('Carlsson').parent().find('[type=checkbox]').click();
    cy.contains('Dawson').parent().find('[type=checkbox]').click();
    cy.get('[data-cy=assign-selected-users]').click();

    // specify team lead
    cy.get('[data-cy=team-lead-user-dropdown]').click();
    cy.get('[role="listbox"]')
      .contains(/Beckley/i)
      .click();

    cy.get('[data-cy=create-visit-button]').click();

    cy.reload();

    // test again that that actions has correct state
    cy.testActionButton(formTeamTitle, 'completed');
    cy.testActionButton(registerVisitTitle, 'active');
    cy.testActionButton(individualTrainingTitle, 'active');
    cy.testActionButton(declareShipmentTitle, 'neutral');
  });

  it('Visitor should only see permitted actions', () => {
    cy.login({ email: 'david@teleworm.us', password: 'Test1234!' });

    cy.contains(/Upcoming experiments/i).should('exist');

    cy.testActionButton(formTeamTitle, 'invisible');
    cy.testActionButton(registerVisitTitle, 'active');
    cy.testActionButton(individualTrainingTitle, 'active');
    cy.testActionButton(declareShipmentTitle, 'neutral');
  });

  it('Visitor should be able to register for a visit', () => {
    cy.login({ email: 'david@teleworm.us', password: 'Test1234!' });

    // test if the actions are available after co-proposer defined the team
    cy.testActionButton(registerVisitTitle, 'active');

    cy.get(`[title="${registerVisitTitle}"]`).click();

    cy.contains(startDateQuestionTitle).parent().click().type('2021-07-20');
    cy.contains(endDateQuestionTitle).parent().click().type('2021-07-21');

    cy.get('[data-cy=save-and-continue-button]').click();

    cy.get('[data-cy=submit-visit-registration-button]').click();

    cy.get('[data-cy="confirm-ok"]').click();

    cy.reload();

    cy.testActionButton(registerVisitTitle, 'completed');
  });

  it('User should not see register for visit or training button if he is not a visitor', () => {
    cy.login({ email: 'Javon4@hotmail.com', password: 'Test1234!' });

    cy.contains(/Upcoming experiments/i).should('exist');

    cy.testActionButton(registerVisitTitle, 'active');
    cy.testActionButton(individualTrainingTitle, 'active');

    cy.get(`[title="${formTeamTitle}"]`).click();

    cy.contains('Carlsson').parent().find('[title=Delete]').click();

    cy.get('[title="Save"]').click();

    cy.get('[data-cy=create-visit-button]').click();

    cy.testActionButton(registerVisitTitle, 'invisible');
    cy.testActionButton(individualTrainingTitle, 'invisible');
  });
});
