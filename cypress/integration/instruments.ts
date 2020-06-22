/// <reference types="Cypress" />
/// <reference types="../types" />

context('Instrument tests', () => {
  const faker = require('faker');

  before(() => {
    cy.resetDB();
  });
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  afterEach(() => {
    cy.wait(1000);
  });

  it('User should not be able to see Instruments page', () => {
    cy.login('user');

    cy.wait(1000);

    let userMenuItems = cy.get('[data-cy="user-menu-items"]');

    userMenuItems.should('not.contain', 'Instruments');
  });

  it('User Officer should able to create Instrument', () => {
    const name = faker.random.words(2);
    const shortCode = faker.random.words(1);
    const description = faker.random.words(8);

    cy.login('officer');

    cy.contains('Instruments').click();
    cy.contains('Create instrument').click();
    cy.get('#name').type(name);
    cy.get('#shortCode').type(shortCode);
    cy.get('#description').type(description);
    cy.contains('Create Instrument').click();

    cy.wait(1000);

    const instrumentsTable = cy.get('[data-cy="instruments-table"]');

    instrumentsTable.should('contain', name);
    instrumentsTable.should('contain', shortCode);
    instrumentsTable.should('contain', description);
  });

  it('User Officer should able to update Instrument', () => {
    const name = faker.random.words(2);
    const shortCode = faker.random.words(1);
    const description = faker.random.words(8);

    cy.login('officer');

    cy.contains('Instruments').click();
    cy.get('[title="Edit Instrument"]').click();
    cy.get('#name').clear();
    cy.get('#name').type(name);
    cy.get('#shortCode').clear();
    cy.get('#shortCode').type(shortCode);
    cy.get('#description').type(description);
    cy.contains('Update Instrument').click();

    cy.wait(1000);

    const instrumentsTable = cy.get('[data-cy="instruments-table"]');

    instrumentsTable.should('contain', name);
    instrumentsTable.should('contain', shortCode);
    instrumentsTable.should('contain', description);
  });

  it('User Officer should able to delete Instrument', () => {
    cy.login('officer');

    cy.contains('Instruments').click();

    cy.get('[title="Delete"]').click();

    cy.get('[title="Save"]').click();

    cy.wait(1000);

    cy.get('[data-cy="instruments-table"]')
      .find('tbody td')
      .should('have.length', 1);

    cy.get('[data-cy="instruments-table"]')
      .find('tbody td')
      .first()
      .then(element => {
        expect(element.text()).to.be.equal('No records to display');
      });
  });
});
