import { faker } from '@faker-js/faker';

import initialDBData from '../support/initialDBData';

context('Instrument tests', () => {
  const technique1 = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
  };

  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });

  it('User should not be able to see Techniques page', () => {
    cy.login('user1', initialDBData.roles.user);
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.get('[data-cy="user-menu-items"]').should('not.contain', 'Techniques');
  });

  describe('Techniques basic tests', () => {
    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
    });

    it('User officer should be able to create technique', function () {
      this.skip();
    });

    it('User officer should be able to update technique', function () {
      this.skip();
    });

    it('User officer should be able to delete technique', function () {
      this.skip();
    });
  });

  describe('Advanced techniques tests as user officer role', () => {
    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
    });

    it('User officer should be able to assign and unassign instruments to technique without page refresh', function () {
      this.skip();
    });
  });
});
