/// <reference types="Cypress" />
/// <reference types="../types" />

context('Settings tests', () => {
  describe('Proposal statuses tests', () => {
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

    it('User should not be able to see Settings page', () => {
      cy.login('user');

      cy.wait(1000);

      let userMenuItems = cy.get('[data-cy="user-menu-items"]');

      userMenuItems.should('not.contain', 'Settings');
    });

    it('User Officer should be able to create Proposal status', () => {
      const name = faker.random.words(2);
      const description = faker.random.words(5);

      // NOTE: Valid proposal status name is uppercase characters without spaces but underscores.
      const validName = name.toUpperCase().replace(' ', '_');

      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal statuses').click();
      cy.contains('Create').click();
      cy.get('#name').type(validName);
      cy.get('#description').type(description);
      cy.get('[data-cy="submit"]').click();

      let proposalStatusesTable = cy.get('[data-cy="proposal-statuses-table"]');

      const lastPageButtonElement = proposalStatusesTable.find(
        'span[title="Last Page"] > button'
      );

      lastPageButtonElement.click({ force: true });

      proposalStatusesTable = cy.get('[data-cy="proposal-statuses-table"]');
      const proposalStatusesTableLastRow = proposalStatusesTable
        .find('tr[level="0"]')
        .last();

      const lastRowText = proposalStatusesTableLastRow.invoke('text');

      lastRowText.should('contain', validName);
      lastRowText.should('contain', description);
    });

    it('User Officer should be able to update Proposal status', () => {
      const name = faker.random.words(2);
      const description = faker.random.words(5);

      // NOTE: Valid proposal status name is uppercase characters without spaces but underscores.
      const validName = name.toUpperCase().replace(' ', '_');

      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal statuses').click();

      let proposalStatusesTable = cy.get('[data-cy="proposal-statuses-table"]');

      const lastPageButtonElement = proposalStatusesTable.find(
        'span[title="Last Page"] > button'
      );

      lastPageButtonElement.click({ force: true });

      cy.get('[title="Edit"]')
        .last()
        .click();

      cy.get('#name')
        .clear()
        .type(validName);
      cy.get('#description').type(description);
      cy.get('[data-cy="submit"]').click();

      proposalStatusesTable = cy.get('[data-cy="proposal-statuses-table"]');
      const proposalStatusesTableLastRow = proposalStatusesTable
        .find('tr[level="0"]')
        .last();

      const lastRowText = proposalStatusesTableLastRow.invoke('text');

      lastRowText.should('not.contain', validName);
      lastRowText.should('not.contain', description);
    });

    it('User Officer should be able to delete Proposal status', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal statuses').click();

      let proposalStatusesTable = cy.get('[data-cy="proposal-statuses-table"]');

      const lastPageButtonElement = proposalStatusesTable.find(
        'span[title="Last Page"] > button'
      );

      lastPageButtonElement.click({ force: true });

      cy.get('[title="Delete"]')
        .last()
        .click();

      cy.get('[title="Save"]').click();

      cy.contains('Proposal status deleted successfully');
    });
  });
});
