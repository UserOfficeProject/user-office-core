/// <reference types="Cypress" />
/// <reference types="../types" />

context('Page tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  afterEach(() => {
    cy.wait(500);
  });

  const faqContents = faker.random.words(2);

  it('Should be able update FAQ', () => {
    cy.login('officer');

    cy.contains('Pages').click();

    cy.contains('Set user homepage');
    cy.contains('Help').click();

    cy.window().then(win => {
      cy.wait(5000).then(() => {
        win.tinyMCE.get('HELPPAGE').setContent(faqContents); // faq page editor
        cy.contains('Update').click();
        cy.wait(2000);
        cy.reload();
        cy.contains('Proposals').click();
        cy.contains('FAQ').click();
        cy.wait(3000).then(() => {
          cy.contains(faqContents);
          cy.contains('Close').click();
          cy.logout();
        });
      });
    });
  });
});
