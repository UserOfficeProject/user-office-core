import { faker } from '@faker-js/faker';

import initialDBData from '../support/initialDBData';

context('Technique tests', () => {
  const technique1 = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
  };

  const scientist1 = initialDBData.users.user1;
  const scientist2 = initialDBData.users.user2;

  const instrument1 = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
    managerUserId: scientist1.id,
  };

  const instrument2 = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
    managerUserId: scientist2.id,
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
      cy.contains('Techniques').click();
      cy.contains('Create').click();
      cy.get('#name').type(technique1.name);
      cy.get('#shortCode').type(technique1.shortCode);
      cy.get('#description').type(technique1.description);

      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'created successfully' });

      cy.contains(technique1.name);
      cy.contains(technique1.shortCode);
      cy.contains(technique1.description);
    });

    it('User officer should be able to update technique', function () {
      const newName = faker.random.words(2);
      const newShortCode = faker.random.alphaNumeric(15);
      const newDescription = faker.random.words(5);
      //cy.createTechnique(technique1);

      cy.contains('Techniques').click();
      cy.contains(technique1.name).parent().find('[aria-label="Edit"]').click();
      cy.get('#name').clear();
      cy.get('#name').type(newName);
      cy.get('#shortCode').clear();
      cy.get('#shortCode').type(newShortCode);
      cy.get('#description').type(newDescription);
      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'updated successfully' });

      cy.get('[data-cy="techniques-table"]').as('techniquesTable');

      cy.get('@techniquesTable').should('contain', newName);
      cy.get('@techniquesTable').should('contain', newShortCode);
      cy.get('@techniquesTable').should('contain', newDescription);
    });

    it('User officer should be able to delete technique', function () {
      //cy.createTechnique(technique1);

      cy.contains('Techniques').click();

      cy.contains(technique1.name)
        .parent()
        .find('[aria-label="Delete"]')
        .click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({ variant: 'success', text: 'Technique removed' });

      cy.contains(technique1.name).should('not.exist');
    });
  });

  describe('Advanced techniques tests as user officer role', () => {
    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
      cy.createInstrument(instrument1);
      cy.createInstrument(instrument2);
    });

    it('User officer should be able to assign and unassign instruments to technique without page refresh', function () {
      cy.createInstrument(instrument1);
      cy.createInstrument(instrument2);
      //cy.createTechnique(technique1);

      cy.contains(technique1.name)
        .parent()
        .find('[aria-label="Delete"]')
        .click();
    });
  });
});
