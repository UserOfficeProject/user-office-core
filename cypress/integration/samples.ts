/// <reference types="Cypress" />
/// <reference types="../types" />

context('Samples tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  const sampleTemplateName = faker.lorem.words(1);
  const sampleTemplateDescription = faker.lorem.words(4);
  const sampleQuestion = faker.lorem.words(4);

  it('Should be able to create proposal template with sample', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Sample declaration templates');

    cy.get('[data-cy=create-new-button]').click();

    cy.get('[data-cy=name]').type(sampleTemplateName);

    cy.get('[data-cy=description]').type(sampleTemplateDescription);

    cy.get('[data-cy=submit]').click();

    cy.get('[title="Edit"]')
      .first()
      .click();

    cy.contains('Add topic').click();

    cy.visit('/');

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.get('[title="Edit"]')
      .first()
      .click();

    cy.contains('Add topic').click();

    cy.get('[data-cy=show-more-button]').click();

    cy.contains('Add question').click();

    cy.get('[data-cy=questionPicker] [data-cy=show-more-button]').click();

    cy.contains('Add Subtemplate').click();

    cy.get('[data-cy=question]')
      .clear()
      .type(sampleQuestion);

    cy.get('[data-cy=template-id]').click();

    cy.contains(sampleTemplateName).click();

    cy.contains('Save').click();

    cy.get('body').type('{alt}', { release: false });

    cy.contains(sampleQuestion).click();
  });

  it('Should be able to create proposal with sample', () => {
    cy.login('user');

    cy.contains('New Proposal').click();

    cy.get('#title').type(faker.lorem.words(2));

    cy.get('#abstract').type(faker.lorem.words(5));

    cy.contains('Save and continue').click();

    cy.get('[data-cy=add-button]').click();

    cy.get('[data-cy=title-input] input')
      .clear()
      .type(faker.lorem.words(2));

    cy.get('[data-cy=save-button]').click();

    cy.contains('Save and continue').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();
  });

  it('Should be able to evaluate sample', () => {
    cy.login('officer');

    cy.contains('Sample safety').click();

    cy.get('[title="Review sample"]').click();

    cy.contains('Accept').click();

    cy.contains('SAFE').click();

    cy.reload();

    cy.get('[title="Review sample"]').click();

    cy.contains('Reject').click();

    cy.contains('UNSAFE').click();
  });
});
