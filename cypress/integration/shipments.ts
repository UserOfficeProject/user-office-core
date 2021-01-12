import faker from 'faker';

context('Shipments tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  const proposalTitle = faker.lorem.words(2);
  const shipmentTemplateName = faker.lorem.words(2);
  const shipmentTemplateDescription = faker.lorem.words(3);

  const sampleTemplateName = faker.lorem.words(2);
  const sampleTemplateDescription = faker.lorem.words(3);

  const sampleQuestion = faker.lorem.words(2);

  const sampleTitle = faker.lorem.words(2);

  const shipmentTitle = faker.lorem.words(2);

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

    cy.visit('/');

    cy.navigateToTemplatesSubmenu('Shipment declaration templates');

    cy.get("[title='Mark as active']").click();
  });

  it('Should be able to create proposal template with sample', () => {
    cy.login('officer');

    cy.createTemplate('sample', sampleTemplateName, sampleTemplateDescription);

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.contains('default template')
      .parent()
      .get("[title='Edit']")
      .first()
      .click();

    cy.createTopic('New topic');

    cy.createSampleQuestion(sampleQuestion, sampleTemplateName);

    cy.contains(sampleQuestion)
      .parent()
      .dragElement([{ direction: 'left', length: 1 }]);
  });

  it('Should be able to declare sample', () => {
    cy.login('user');

    cy.createProposal(proposalTitle);

    cy.get('[data-cy=add-button]').click();
    cy.get('[data-cy=title-input]').type(sampleTitle);

    cy.get(
      '[data-cy=sample-declaration-modal] [data-cy=save-and-continue-button]'
    ).click();

    cy.get('[data-cy=save-and-continue-button]').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();
  });

  it('Should be able to declare shipment', () => {
    cy.login('user');

    cy.contains('My shipment').click();

    cy.get('[data-cy=create-new-entry]').click();

    cy.get('[data-cy=title-input] input')
      .click()
      .clear()
      .type(shipmentTitle)
      .should('have.value', shipmentTitle);

    cy.get('[data-cy=select-proposal-dropdown]').click();

    cy.contains(proposalTitle).click();

    cy.get('[data-cy=samples-dropdown]').click();

    cy.contains(sampleTitle).click();

    cy.get('body').type('{esc}');

    cy.get('[data-cy=save-and-continue-button]').click();

    cy.contains('Finish').click();

    cy.contains('OK').click();

    cy.contains(shipmentTitle).click();
  });

  it('Should be able to delete shipment', () => {
    cy.login('user');

    cy.contains('My shipment').click();

    cy.contains(shipmentTitle)
      .parent()
      .get("[title='Delete shipment']")
      .first()
      .click();

    cy.contains('OK').click();

    cy.get('[data-cy=shipments-table]').should('not.contain', shipmentTitle);
  });
});
