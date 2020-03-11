/// <reference types="Cypress" />

context('Event log tests', () => {
  const faker = require('faker');

  before(() => {
    //@ts-ignore
    cy.resetDB();
  });
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  afterEach(() => {
    cy.wait(2000);
  });

  it('If user creates a proposal, officer should be able to see the event logs for that proposal', () => {
    const title = faker.random.words(3);
    const abstract = faker.random.words(8);
    //@ts-ignore
    cy.login('user');

    cy.contains('New Proposal').click();
    cy.get('#title').type(title);
    cy.get('#abstract').type(abstract);
    cy.contains('Save and continue').click();

    cy.contains('Logout').click();

    //@ts-ignore
    cy.login('officer');

    cy.get('button[title="View proposal"]')
      .first()
      .click();
    cy.contains('Logs').click();
    cy.contains('PROPOSAL_CREATED');
    cy.contains('Javon4@hotmail.com');
  });

  it('If user uptates his info, officer should be able to see the event logs for that update', () => {
    const newFirstName = faker.name.firstName();
    //@ts-ignore
    cy.login('user');

    cy.get("[data-cy='profile-page-btn']").click();

    cy.get("[name='firstname']")
      .clear()
      .type(newFirstName);

    cy.contains('Update Profile').click();

    cy.contains('Logout').click();

    //@ts-ignore
    cy.login('officer');

    cy.contains('View People').click();

    cy.get('button[title="Edit user"]')
      .last()
      .click();

    cy.get("[name='firstname']").should('have.value', newFirstName);

    // NOTE: Should wait because event log component is not visible for some time.
    cy.wait(300);

    cy.get('span[title="Last Page"]')
      .last()
      .click();

    cy.contains('USER_UPDATED');
    cy.contains('Javon4@hotmail.com');
  });
});
