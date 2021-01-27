import faker from 'faker';

context('Proposal tests', () => {
  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  it('Should be able create proposal', () => {
    cy.login('user');

    cy.contains('New Proposal').click();

    cy.get('[data-cy=edit-proposer-button]').click();
    cy.contains('Benjamin')
      .parent()
      .find("[title='Select user']")
      .click();

    cy.contains('Save and continue').click();

    cy.contains('Title is required');
    cy.contains('Abstract is required');
    cy.contains(
      'You must be part of the proposal. Either add yourself as Principal Investigator or a Co-Proposer!'
    );

    const title = faker.lorem.words(2);
    const abstract = faker.lorem.words(3);
    cy.get('[data-cy=edit-proposer-button]').click();
    cy.contains('Carl')
      .parent()
      .find("[title='Select user']")
      .click();

    cy.get('[data-cy=title] input')
      .type(title)
      .should('have.value', title);

    cy.get('[data-cy=abstract] textarea')
      .first()
      .type(abstract)
      .should('have.value', abstract);

    cy.contains('Save and continue').click();

    cy.finishedLoading();

    cy.contains('Dashboard').click();

    cy.contains(title)
      .parent()
      .contains('draft');

    cy.get('[title="Edit proposal"]')
      .should('exist')
      .click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains('Dashboard').click();
    cy.contains(title);
    cy.contains('submitted');

    cy.get('[title="View proposal"]').should('exist');
  });
});
