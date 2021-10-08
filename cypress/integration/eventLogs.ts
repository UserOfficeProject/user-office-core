import dateformat from 'dateformat';
import faker from 'faker';

context('Event log tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  it('If user creates a proposal, officer should be able to see the event logs for that proposal', () => {
    cy.login('user');

    cy.createProposal();

    cy.logout();

    cy.login('officer');

    cy.get("[data-cy='view-proposal']").first().click();
    cy.contains('Logs').click({ force: true });
    cy.contains('PROPOSAL_CREATED');
  });

  it('If user uptates his info, officer should be able to see the event logs for that update', () => {
    const newFirstName = faker.name.firstName();

    cy.login('user');

    cy.get('[data-cy="active-user-profile"]').click();

    cy.get("[name='firstname']").clear().type(newFirstName);

    cy.contains('Update Profile').click();

    // NOTE: Hour date format is enough because we don't know the exact time in seconds and minutes when update will happen in the database.
    const updateProfileDate = dateformat(new Date(), 'dd-mmm-yyyy HH');

    cy.logout();

    cy.login('officer');

    cy.contains('People').click();

    cy.get('[aria-label="Search"]').type('Carlsson');

    cy.contains('Carlsson').parent().find('button[title="Edit user"]').click();

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
