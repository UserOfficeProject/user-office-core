import faker from 'faker';

faker.seed(1);

const declareShipmentTitle = 'Declare shipment(s)';

const proposalTitle = 'Test proposal';

const sampleTitle = /My sample title/i;

const shipmentTitle = faker.lorem.words(2);
const shipmentTemplateName = faker.lorem.words(2);
const shipmentTemplateDescription = faker.lorem.words(3);

context('Shipments tests', () => {
  before(() => {
    cy.viewport(1920, 1080);

    cy.resetDB(true);
    cy.resetSchedulerDB(true);

    // allocate time for the proposal
    cy.login('officer');
    cy.allocateProposalTime({
      proposalTitle: proposalTitle,
      timeToAllocate: 2,
      submitManagementDecision: true,
    });
    // create and activate booking
    const eventDate = faker.date.future().toISOString().split('T')[0];
    cy.createScheduledEvent(1, {
      startsAt: `${eventDate} 10:00`,
      endsAt: `${eventDate} 11:00`,
    });
    cy.activateBooking(1);
    cy.logout();

    // Create team
    cy.login('user');
    cy.defineExperimentTeam({
      proposalTitle: proposalTitle,
      users: ['Carlsson', 'Dawson'],
      teamLead: 'Carlsson',
    });
    cy.logout();
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  it('Should be able to create shipments template', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Shipment declaration templates');

    cy.get('[data-cy=create-new-button]').click();

    cy.get('[data-cy=name] input')
      .type(shipmentTemplateName)
      .should('have.value', shipmentTemplateName);

    cy.get('[data-cy=description]').type(shipmentTemplateDescription);

    cy.get('[data-cy=submit]').click();

    cy.contains('New shipment');
  });

  it('Co-proposer should see that he can declare shipment', () => {
    cy.login('user');
    cy.testActionButton(declareShipmentTitle, 'neutral');
  });

  it('Visitor should see that he can declare shipment', () => {
    cy.login({ email: 'david@teleworm.us', password: 'Test1234!' });
    cy.testActionButton(declareShipmentTitle, 'neutral');
  });

  it('PI should be able to declare shipment', () => {
    cy.login('user');

    cy.testActionButton(declareShipmentTitle, 'neutral');

    cy.contains(proposalTitle)
      .parent()
      .find(`[title="${declareShipmentTitle}"]`)
      .click();

    cy.get('[data-cy=title-input] input')
      .click()
      .clear()
      .type(shipmentTitle)
      .should('have.value', shipmentTitle);

    cy.get('[data-cy=select-proposal-dropdown]').click();

    cy.get('[role="listbox"]').contains(proposalTitle).click();

    cy.get('[data-cy=samples-dropdown]').click();

    cy.get('[role="listbox"]').contains(sampleTitle).click();

    cy.get('body').type('{esc}');

    cy.get('[data-cy=save-and-continue-button]').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains(proposalTitle);

    cy.contains('SUBMITTED', { matchCase: false });

    cy.get('[data-cy=download-shipment-label]').click();

    cy.get('[data-cy="preparing-download-dialog"]').should('exist');

    cy.get('body').type('{esc}');

    cy.visit('/');

    cy.testActionButton(declareShipmentTitle, 'completed');
  });
});
