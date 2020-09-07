/// <reference types="Cypress" />
/// <reference types="../types" />

context('Institution tests', () => {
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

  it('User should not be able to see Institutions page', () => {
    cy.login('user');

    cy.wait(1000);

    let userMenuItems = cy.get('[data-cy="user-menu-items"]');

    userMenuItems.should('not.contain', 'Institutions');
  });

  it('User Officer should be able to create Institution', () => {
    const name = faker.random.words(2);

    cy.login('officer');

    cy.contains('Institutions').click();
    cy.contains('Create').click();
    cy.get('#name').type(name);
    cy.get('[data-cy="submit"]').click();

    cy.wait(1000);

    let institutionsTable = cy.get('[data-cy="institutions-table"]');

    const lastPageButtonElement = institutionsTable.find(
      'span[title="Last Page"] > button'
    );

    lastPageButtonElement.click({ force: true });

    // NOTE: Need to re-query for the element because it gets detached from the DOM. This is because of how MaterialTable pagination works.
    institutionsTable = cy.get('[data-cy="institutions-table"]');
    const institutionsTableLastRow = institutionsTable
      .find('tr[level="0"]')
      .last();

    const lastRowText = institutionsTableLastRow.invoke('text');

    lastRowText.should('contain', name);
  });

  it('User Officer should be able to update Institution', () => {
    const name = faker.random.words(2);

    cy.login('officer');

    cy.contains('Institutions').click();
    cy.get('[title="Edit"]')
      .first()
      .click();
    cy.get('#name').clear();
    cy.get('#name').type(name);
    cy.get('[data-cy="submit"]').click();

    cy.wait(1000);

    const institutionsTable = cy.get('[data-cy="institutions-table"]');

    institutionsTable.should('contain', name);
  });

  it('User Officer should be able to delete Institution', () => {
    cy.login('officer');

    cy.contains('Institutions').click();

    let institutionsTable = cy.get('[data-cy="institutions-table"]');

    const lastPageButtonElement = institutionsTable.find(
      'span[title="Last Page"] > button'
    );

    lastPageButtonElement.click({ force: true });

    cy.get('[title="Delete"]')
      .last()
      .click();

    cy.get('[title="Save"]').click();

    cy.contains('Institution removed!');

    cy.wait(500);
  });
});
