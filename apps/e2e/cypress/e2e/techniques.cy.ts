import { faker } from '@faker-js/faker';

import initialDBData from '../support/initialDBData';

context('Technique tests', () => {
  const technique = {
    name: faker.string.alpha(2),
    shortCode: faker.string.alphanumeric(15),
    description: faker.string.alpha(5),
  };

  const scientist1 = initialDBData.users.user1;
  const scientist2 = initialDBData.users.user2;

  const instrument1 = {
    name: faker.string.alpha(2),
    shortCode: faker.string.alphanumeric(15),
    description: faker.string.alpha(5),
    managerUserId: scientist1.id,
  };

  const instrument2 = {
    name: faker.string.alpha(2),
    shortCode: faker.string.alphanumeric(15),
    description: faker.string.alpha(5),
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
    let createdInstrumentId: number;
    let createdTechniqueId: number;

    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
    });

    it('User officer should be able to create technique', function () {
      cy.contains('Techniques').click();
      cy.contains('Create').click();
      cy.get('#name').type(technique.name);
      cy.get('#shortCode').type(technique.shortCode);
      cy.get('#description').type(technique.description);

      cy.get('[data-cy="submit"]').click();

      cy.notification({ variant: 'success', text: 'created successfully' });

      cy.contains(technique.name);
      cy.contains(technique.shortCode);
      cy.contains(technique.description);
    });

    it('User officer should be able to update technique', function () {
      const newName = faker.string.alpha(2);
      const newShortCode = faker.string.alphanumeric(15);
      const newDescription = faker.string.alpha(5);
      cy.createTechnique(technique);

      cy.contains('Techniques').click();
      cy.contains(technique.name).parent().find('[aria-label="Edit"]').click();
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
      cy.createInstrument(instrument1).then((result) => {
        if (result.createInstrument) {
          createdInstrumentId = result.createInstrument.id;
        }
      });
      cy.createTechnique(technique).then((result) => {
        if (result.createTechnique) {
          createdTechniqueId = result.createTechnique.id;
        }
      });
      cy.assignInstrumentsToTechnique({
        instrumentIds: [createdInstrumentId],
        techniqueId: createdTechniqueId,
      });

      cy.contains('Techniques').click();

      cy.contains(technique.name)
        .parent()
        .find('[aria-label="Delete"]')
        .click();

      cy.get('[aria-label="Save"]').click();

      cy.notification({ variant: 'success', text: 'Technique deleted' });

      cy.contains(technique.name).should('not.exist');
    });
  });

  describe('Advanced techniques tests as user officer role', () => {
    beforeEach(() => {
      cy.login('officer');
      cy.visit('/');
      cy.createTechnique(technique);
      cy.createInstrument(instrument1);
      cy.createInstrument(instrument2);
    });

    it('User officer should be able to assign and unassign instruments to technique without page refresh', function () {
      cy.contains('Techniques').click();

      cy.finishedLoading();

      cy.contains(technique.name)
        .parent()
        .find('[aria-label="Assign/remove instruments"]')
        .click();

      cy.get('[data-cy="technique-instruments-assignment"]').click();

      cy.get('[data-cy="technique-instruments-assignment"]')
        .contains('Loading...')
        .should('not.exist');

      cy.get('#selectedInstrumentIds-input').first().click();

      cy.get('[data-cy="instrument-selection-options"] li')
        .contains(instrument1.name)
        .click();

      cy.get('[data-cy="submit-assign-remove-instrument"]').click();

      cy.get('[data-cy="proposals-instrument-assignment"]').should('not.exist');

      cy.notification({
        variant: 'success',
        text: 'Instrument/s assigned to the selected technique successfully!',
      });

      cy.contains(technique.shortCode)
        .parent()
        .find('[aria-label="Detail panel visibility toggle"]')
        .click();

      cy.get('[data-cy="technique-instrument-assignments-table"]').contains(
        instrument1.shortCode
      );

      cy.contains(technique.name)
        .parent()
        .find('[aria-label="Assign/remove instruments"]')
        .click();

      cy.contains('Loading...').should('not.exist');

      cy.get('[data-cy="instrument-selection"]').should(
        'contain',
        instrument1.name
      );

      cy.get('[data-cy="technique-instruments-assignment"]').click();

      cy.get('[data-cy="technique-instruments-assignment"]')
        .contains('Loading...')
        .should('not.exist');

      cy.get('[title="Clear"]').click();

      cy.get('[data-cy="remove-instrument-alert"]').should('exist');

      cy.get('[data-cy="submit-assign-remove-instrument"]').click();

      cy.notification({
        variant: 'success',
        text: 'Instrument/s unassigned from selected technique successfully!',
      });

      cy.get('[data-cy="technique-instrument-assignments-table"]')
        .children()
        .should('not.contain', instrument1.shortCode);
    });
  });
});
