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

  const sampleTemplateName = faker.lorem.words(2);
  const sampleTemplateDescription = faker.lorem.words(4);
  const sampleQuestion = faker.lorem.words(4);
  const proposalTitle = faker.lorem.words(2);
  const proposalAbstract = faker.lorem.words(5);
  const safetyComment = faker.lorem.words(5);

  it('Should be able to create proposal template with sample', () => {
    cy.login('officer');

    cy.navigateToTemplatesSubmenu('Sample declaration templates');

    cy.get('[data-cy=create-new-button]').click();

    cy.get('[data-cy=name]').type(sampleTemplateName);

    cy.get('[data-cy=description]').type(sampleTemplateDescription);

    cy.get('[data-cy=submit]').click();

    cy.contains('2. New Topic');

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

    cy.get('#title').type(proposalTitle);

    cy.get('#abstract').type(proposalAbstract);

    cy.contains('Save and continue').click();

    cy.get('[data-cy=add-button]').click();

    cy.wait(500);

    cy.get('[data-cy=save-button]').click();

    cy.contains('Save and continue').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();
  });

  it('Should be able to evaluate sample', () => {
    cy.login('officer');

    cy.contains('Sample safety').click();

    cy.get('[title="Review sample"]').click();

    cy.get('[data-cy="safety-status"]').click();

    cy.contains('Safe').click();

    cy.get('[data-cy="safety-comment"]').type(safetyComment);

    cy.get('[data-cy="submit"]').click();

    cy.wait(500);

    cy.reload();

    cy.get('[title="Review sample"]').click();

    cy.contains(safetyComment); // test if comment entered is present after reload

    cy.get('[data-cy="safety-status"]').click();

    cy.contains('Unsafe').click();

    cy.get('[data-cy="submit"]').click();

    cy.contains('Unsafe'); // test if status has changed
  });

  it('Officer should able to delete proposal with sample', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get("input[type='checkbox']")
      .first()
      .click();

    cy.get("[title='Delete proposals']")
      .first()
      .click();

    cy.contains('Yes').click();

    cy.contains(proposalTitle).should('not.exist');
  });
});
