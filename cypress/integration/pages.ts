/// <reference types="Cypress" />
var faker = require('faker');

context('Page tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  afterEach(() => {
    cy.wait(2000);
  });

  const faqContents = faker.random.words(2);
  const ADMIN_EMAIL = 'Aaron_Harris49@gmail.com';
  const ADMIN_PASS = 'Test1234!';

  it('Should be able update FAQ', () => {
    cy.get('[data-cy=input-email] input')
      .type(ADMIN_EMAIL)
      .should('have.value', ADMIN_EMAIL);

    cy.get('[data-cy=input-password] input')
      .type(ADMIN_PASS)
      .should('have.value', ADMIN_PASS);

    cy.get('[data-cy=submit]').click();

    cy.contains('Edit Pages').click();

    cy.contains('Set user homepage');
    cy.contains('help').click();

    cy.window().then(win => {
      cy.wait(10000).then(() => {
        win.tinyMCE.get('HELPPAGE').setContent(faqContents); // faq page editor
        cy.get('#help-update-btn').click();
        cy.reload();
        cy.contains('View Proposals').click();
        cy.contains('FAQ').click();
        cy.wait(3000).then(() => {
          cy.contains(faqContents);
          cy.contains('Close').click();
          cy.contains('Logout').click();
        });
      });
    });
  });
});
