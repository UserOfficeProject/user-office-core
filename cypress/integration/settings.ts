/// <reference types="Cypress" />
/// <reference types="../types" />

context('Settings tests', () => {
  const faker = require('faker');

  describe('Proposal statuses tests', () => {
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
      const validName = name.toUpperCase().replace(/\s/g, '_');

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
      const newName = faker.random.words(2);
      const newDescription = faker.random.words(5);

      // NOTE: Valid proposal status name is uppercase characters without spaces but underscores.
      const newValidName = newName.toUpperCase().replace(/\s/g, '_');

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

      cy.get('#name').clear();
      cy.get('#name').type(newValidName);
      cy.get('#description').type(newDescription);
      cy.get('[data-cy="submit"]').click();

      proposalStatusesTable = cy.get('[data-cy="proposal-statuses-table"]');
      const proposalStatusesTableLastRow = proposalStatusesTable
        .find('tr[level="0"]')
        .last();

      const lastRowText = proposalStatusesTableLastRow.invoke('text');

      lastRowText.should('contain', newValidName);
      lastRowText.should('contain', newDescription);
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

  describe('Proposal workflows tests', () => {
    const spaceKeyCode = 32;
    const arrowLeftKeyCode = 37;
    const arrowRightKeyCode = 39;
    const arrowDownKeyCode = 40;

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

    it('User Officer should be able to create proposal workflow', () => {
      const name = faker.random.words(2);
      const description = faker.random.words(5);

      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.contains('Create').click();
      cy.get('#name').type(name);
      cy.get('#description').type(description);
      cy.get('[data-cy="submit"]').click();

      let proposalWorkflowsTable = cy.get(
        '[data-cy="proposal-workflows-table"]'
      );

      const proposalWorkflowsTableLastRow = proposalWorkflowsTable
        .find('tr[level="0"]')
        .last();

      const lastRowText = proposalWorkflowsTableLastRow.invoke('text');

      lastRowText.should('contain', name);
      lastRowText.should('contain', description);
    });

    it('User Officer should be able to update proposal workflow', () => {
      const name = faker.random.words(2);
      const description = faker.random.words(5);

      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.get('[title="Edit"]')
        .last()
        .click();

      cy.contains('Edit').click();

      cy.get('#name')
        .clear()
        .type(name);
      cy.get('#description')
        .clear()
        .type(description);
      cy.get('[data-cy="submit"]').click();

      cy.get('[data-cy="proposal-workflow-metadata-container"]')
        .should('contain.text', name)
        .should('contain.text', description);
    });

    it('User Officer should be able to drag and drop statuses in proposal workflow', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.get('[title="Edit"]')
        .last()
        .click();

      cy.get('[data-cy="status_DRAFT_1"]')
        .focus()
        .trigger('keydown', { keyCode: spaceKeyCode })
        .trigger('keydown', { keyCode: arrowLeftKeyCode, force: true })
        .wait(500)
        .trigger('keydown', { keyCode: spaceKeyCode, force: true });

      cy.get('[data-cy="connection_DRAFT_1"]').should('contain.text', 'DRAFT');

      cy.get('[data-cy="status_DRAFT_1"]').should('not.exist');

      cy.contains('Workflow status added successfully');
    });

    it('User Officer should be able to add more statuses in proposal workflow and re-order them', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.get('[title="Edit"]')
        .last()
        .click();

      cy.get('[data-cy="status_FEASIBILITY_REVIEW_2"]')
        .focus()
        .trigger('keydown', { keyCode: spaceKeyCode })
        .trigger('keydown', { keyCode: arrowLeftKeyCode, force: true })
        .wait(500)
        .trigger('keydown', { keyCode: spaceKeyCode, force: true });

      cy.get('[data-cy="connection_FEASIBILITY_REVIEW_2"]').should(
        'contain.text',
        'FEASIBILITY_REVIEW'
      );

      cy.contains('Workflow status added successfully');

      cy.get('[data-cy="status_FEASIBILITY_REVIEW_2"]').should('not.exist');

      cy.get('[data-cy="connection_FEASIBILITY_REVIEW_2"]')
        .focus()
        .trigger('keydown', { keyCode: spaceKeyCode })
        .trigger('keydown', { keyCode: arrowDownKeyCode, force: true })
        .wait(500)
        .trigger('keydown', { keyCode: spaceKeyCode, force: true });

      cy.contains('Workflow statuses reordered successfully');
    });

    it('User Officer should be able to remove statuses from proposal workflow by dragging and dropping them back inside status picker', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.get('[title="Edit"]')
        .last()
        .click();

      cy.get('[data-cy="connection_FEASIBILITY_REVIEW_2"]')
        .focus()
        .trigger('keydown', { keyCode: spaceKeyCode })
        .trigger('keydown', { keyCode: arrowRightKeyCode, force: true })
        .wait(500)
        .trigger('keydown', { keyCode: spaceKeyCode, force: true });

      cy.get('[data-cy="status_FEASIBILITY_REVIEW_2"]').should(
        'contain.text',
        'FEASIBILITY_REVIEW'
      );

      cy.contains('Workflow status removed successfully');

      cy.get('[data-cy="connection_FEASIBILITY_REVIEW_2"]').should('not.exist');
    });

    it('User Officer should be able to remove statuses from proposal workflow using trash icon', () => {
      cy.login('officer');

      cy.contains('Settings').click();
      cy.contains('Proposal workflows').click();

      cy.get('[title="Edit"]')
        .last()
        .click();

      cy.get('[data-cy="remove-workflow-status-button"]').click();

      cy.get('[data-cy="status_DRAFT_1"]').should('contain.text', 'DRAFT');

      cy.contains('Workflow status removed successfully');

      cy.get('[data-cy="connection_DRAFT_1"]').should('not.exist');
    });
  });
});
