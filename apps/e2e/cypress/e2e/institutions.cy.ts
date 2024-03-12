import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';

context('Institution tests', () => {
  beforeEach(function () {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        this.skip();
      }
    });
  });

  it('User should not be able to see Institutions page', () => {
    cy.login('user1');
    cy.visit('/');

    cy.get('[data-cy="profile-page-btn"]').should('exist');

    cy.get('[data-cy="user-menu-items"]').as('userMenuItems');

    cy.get('@userMenuItems').should('not.contain', 'Institutions');
  });

  it('User Officer should be able to update Institution', () => {
    const name = faker.random.words(2);

    cy.login('officer');
    cy.visit('/');

    cy.contains('Institutions').click();
    cy.get('[aria-label="Edit"]').first().click();
    cy.get('#name').clear();
    cy.get('#name').type(name);
    cy.get('#country-input').click();
    cy.contains('Great Britain').click();
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.get('[data-cy="institutions-table"]').as('institutionsTable');

    cy.get('@institutionsTable').should('contain', name);
  });

  it('User Officer should be able to delete Institution', () => {
    cy.login('officer');
    cy.visit('/');

    cy.contains('Institutions').click();

    cy.get('[aria-label="Delete"]').last().click();

    cy.get('[aria-label="Save"]').click();

    cy.contains('Institution removed successfully!');
  });

  it('User Officer should be able to merge Institution', () => {
    const institutionA = 'Other';
    const personFromInstitutionA = 'David';
    const institutionB = 'Aarhus University';
    const mergedName = faker.random.words(2);

    cy.login('officer');
    cy.visit('/');

    cy.contains('People').click();

    cy.contains(personFromInstitutionA)
      .closest('tr')
      .should('contain', institutionA);

    cy.contains('Institutions').click();

    cy.contains(institutionA).closest('TR').find('[aria-label="Edit"]').click();

    cy.get('[aria-label="Merge with existing institution"]').click();

    cy.get('[data-cy="merge-institutions"]').should('be.disabled');

    cy.get('#select-from-institution').should('have.value', institutionA);
    cy.get('#select-to-institution').focus().type('{downarrow}');
    cy.contains(institutionB).click();
    cy.get('#merged-institution-name').clear().type(mergedName);
    cy.get('[data-cy="merge-institutions"]').should('not.be.disabled');

    cy.get('[data-cy="merge-institutions"]').click();

    cy.get('[data-cy="confirm-ok"]').click();

    cy.finishedLoading();

    cy.contains('People').click();

    cy.contains(personFromInstitutionA)
      .closest('tr')
      .should('contain', mergedName);
  });
});
