/// <reference types="Cypress" />
/// <reference types="../types" />

context('Proposal administration tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1100, 900);
    cy.visit('/');
  });

  const textUser = faker.random.words(5);

  const textManager = faker.random.words(5);

  it('Should be able to set comment for user/manager and final status', () => {
    const title = faker.random.words(3);
    const abstract = faker.random.words(8);
    cy.login('user');
    cy.contains('New Proposal').click();
    cy.get('#title').type(title);
    cy.get('#abstract').type(abstract);
    cy.contains('Save and continue').click();
    cy.wait(500);
    cy.contains('Submit').click();
    cy.contains('OK').click();
    cy.contains('Logout').click();

    cy.login('officer');

    cy.contains('View Proposals').click();

    cy.get('[data-cy=view-proposal]').click();

    cy.contains('Admin').click();

    cy.get('#mui-component-select-finalStatus').click();

    cy.contains('Accepted').click();

    cy.get('#mui-component-select-proposalStatus').click();

    cy.contains('Draft').click();

    cy.get('[data-cy=commentForUser]').type(textUser);

    cy.get('[data-cy=commentForManagement]').type(textManager);

    cy.contains('Update').click();

    cy.wait(1000);

    cy.reload();

    cy.contains('Admin').click();

    cy.contains(textUser);

    cy.contains(textManager);

    cy.contains('Accepted');

    cy.contains('Draft');

    cy.contains('View Proposals').click();

    cy.contains('Open');
  });
});
