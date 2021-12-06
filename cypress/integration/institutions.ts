import faker from 'faker';

context('Institution tests', () => {
  beforeEach(() => {
    cy.resetDB();
    cy.viewport(1920, 1080);
  });

  it('User should not be able to see Institutions page', () => {
    cy.login('user');
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.get('[data-cy="user-menu-items"]').as('userMenuItems');

    cy.get('@userMenuItems').should('not.contain', 'Institutions');
  });

  it('User Officer should be able to create Institution', () => {
    const name = faker.random.words(2);

    cy.login('officer');
    cy.visit('/');

    cy.contains('Institutions').click();
    cy.contains('Create').click();
    cy.get('#name').type(name);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.get('[data-cy="institutions-table"]').as('institutionsTable');

    cy.get('@institutionsTable')
      .find('span[title="Last Page"] > button')
      .as('lastPageButtonElement');

    cy.get('@lastPageButtonElement').click({ force: true });

    // NOTE: Need to re-query for the element because it gets detached from the DOM. This is because of how MaterialTable pagination works.
    cy.get('[data-cy="institutions-table"]').as('newInstitutionsTable');
    cy.get('@newInstitutionsTable')
      .find('tr[level="0"]')
      .last()
      .as('institutionsTableLastRow');

    cy.get('@institutionsTableLastRow').invoke('text').as('lastRowText');

    cy.get('@lastRowText').should('contain', name);
  });

  it('User Officer should be able to update Institution', () => {
    const name = faker.random.words(2);

    cy.login('officer');
    cy.visit('/');

    cy.contains('Institutions').click();
    cy.get('[title="Edit"]').first().click();
    cy.get('#name').clear();
    cy.get('#name').type(name);
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.get('[data-cy="institutions-table"]').as('institutionsTable');

    cy.get('@institutionsTable').should('contain', name);
  });

  it('User Officer should be able to delete Institution', () => {
    cy.login('officer');
    cy.visit('/');

    cy.contains('Institutions').click();

    cy.get('[title="Delete"]').last().click();

    cy.get('[title="Save"]').click();

    cy.contains('Institution removed successfully!');
  });
});
