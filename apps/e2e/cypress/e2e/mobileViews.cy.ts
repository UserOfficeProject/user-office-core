import initialDBData from '../support/initialDBData';

context('Mobile views tests', () => {
  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
    cy.viewport('iphone-x');
  });

  it('A user officer should not see sidebar menu by default on mobile if not opened but be able to open it', () => {
    cy.login('officer');
    cy.visit('/');

    cy.finishedLoading();

    cy.get('[data-cy="officer-proposals-table"]').should('exist');

    cy.get('[data-cy="officer-menu-items"]').should('not.exist');

    cy.get('[data-cy="open-drawer"]').click({ force: true });

    cy.get('[data-cy="officer-menu-items"]').should('exist');
  });

  it('Action buttons on a modal should be visible on smaller screens', () => {
    cy.viewport('macbook-11');
    cy.login('user1', initialDBData.roles.user);
    cy.visit('/');

    cy.contains('New Proposal').click();
    cy.get('[data-cy=call-list]').find('li:first-child').click();

    cy.get('[data-cy=add-participant-button]').click();

    cy.get('[role="presentation"] [role="dialog"]').as('modal');

    cy.get('[data-cy="invite-user-autocomplete"]').type(
      initialDBData.users.user2.email
    );

    cy.get('[role=presentation]')
      .contains(initialDBData.users.user2.lastName)
      .click();

    cy.get('[data-cy="invite-user-submit-button"]')
      .should('be.enabled')
      .click();

    cy.finishedLoading();

    cy.get('[data-cy="co-proposers"]').contains(
      initialDBData.users.user2.lastName
    );
  });
});
