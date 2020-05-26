/// <reference types="Cypress" />
/// <reference types="../types" />

context('Event log tests', () => {
  const faker = require('faker');
  const dateformat = require('dateformat');

  before(() => {
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

    cy.login('user');

    cy.contains('New Proposal').click();
    cy.get('#title').type(title);
    cy.get('#abstract').type(abstract);
    cy.contains('Save and continue').click();

    cy.contains('Logout').click();

    cy.login('officer');

    cy.get("[data-cy='view-proposal']")
      .first()
      .click();
    cy.contains('Logs').click({ force: true });
    cy.contains('PROPOSAL_CREATED');
  });

  it('If user uptates his info, officer should be able to see the event logs for that update', () => {
    const newFirstName = faker.name.firstName();

    cy.login('user');

    cy.get("[data-cy='profile-page-btn']").click();

    cy.get("[name='firstname']")
      .clear()
      .type(newFirstName);

    cy.contains('Update Profile').click();

    // NOTE: Hour date format is enough because we don't know the exact time in seconds and minutes when update will happen in the database.
    const updateProfileDate = dateformat(new Date(), 'dd-mmm-yyyy HH');

    cy.contains('Logout').click();

    cy.login('officer');

    cy.contains('View People').click();

    cy.wait(2000);

    let peopleTable = cy.get('[data-cy="co-proposers"]');

    const lastPeoplePageButtonElement = peopleTable.find(
      'span[title="Last Page"] > button'
    );

    lastPeoplePageButtonElement.click({ force: true });

    cy.get('button[title="Edit user"]')
      .last()
      .click();

    cy.get("[name='firstname']").should('have.value', newFirstName);

    cy.contains('Logs').click();

    let eventLogsTable = cy.get('[data-cy="event-logs-table"]');

    const lastPageButtonElement = eventLogsTable.find(
      'span[title="Last Page"] > button'
    );

    lastPageButtonElement.click({ force: true });

    // NOTE: Need to re-query for the element because it gets detached from the DOM. This is because of how MaterialTable pagination works.
    eventLogsTable = cy.get('[data-cy="event-logs-table"]');
    const eventLogsTableLastRow = eventLogsTable.find('tr[level="0"]').last();

    const lastRowText = eventLogsTableLastRow.invoke('text');

    lastRowText.should('contain', 'USER_UPDATED');
    lastRowText.should('contain', updateProfileDate);
  });
});
