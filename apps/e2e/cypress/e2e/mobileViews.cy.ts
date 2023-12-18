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

    cy.get('[data-cy="officer-menu-items"]').should('not.be.visible');

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

    cy.get('@modal').contains('No Previous Collaborators');

    cy.get('@modal')
      .find('[data-cy="assign-selected-users"]')
      .should('be.visible');

    cy.finishedLoading();

    cy.get('[data-cy=email]').type(initialDBData.users.user2.email);

    cy.get('[data-cy="findUser"]').click();
    cy.finishedLoading();

    cy.get('@modal')
      .find('tr[index="0"]')
      .contains(initialDBData.users.user2.firstName);

    cy.get('@modal').contains('1 user(s) selected');

    cy.get('@modal')
      .find('[data-cy="assign-selected-users"]')
      .should('be.visible');
  });
});
