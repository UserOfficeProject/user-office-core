import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Invites tests', () => {
  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });
  describe('Creating invites', () => {
    it('Should be able to delete invite', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }

      const email = 'john@example.com';

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');

      cy.get('[data-cy="invite-user-submit-button"]').click();
      cy.get('[data-cy="invites-chips"]').should(
        'contain.text',
        'john@example.com'
      );
      cy.get('[data-testid="CancelIcon"]').click();
      cy.get('[data-cy="invites-chips"]').should('not.exist');
    });

    it('Should be able to see invite at the review window', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }

      const email = 'john@example.com';

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');

      cy.get('[data-cy="invite-user-submit-button"]').click();
      cy.get('#title-input').type(faker.lorem.words(2));
      cy.get('#abstract-input').type(faker.lorem.words(3));
      cy.get('[data-cy="save-and-continue-button"]').click();
      cy.get('[data-cy="questionary-details-view"]')
        .contains('Invited')
        .closest('tr')
        .contains(email);
    });

    it('Should be able to invite user by email', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }

      const email = 'john@example.com';

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');

      cy.get('[data-cy="invite-user-submit-button"]').click();
      cy.get('.MuiChip-label').should('have.text', email);
    });

    it('Should be able to add user by first name to proposal', function () {
      cy.resetDB(true);
      const userFirstName = initialDBData.users.user2.firstName;

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(
        userFirstName.substring(0, 5)
      );

      cy.get('#\\:r3f\\:-option-0').click();
      cy.get('[data-cy="invite-user-submit-button"]').click();
      cy.get('[data-cy="co-proposers"]').contains('Benjamin').should('exist');
    });

    it('Should not be able to invite same email twice', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }

      const email = 'john@example.com';

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');

      cy.get('[data-cy="invite-user-submit-button"]').click();

      cy.get('[data-cy="add-participant-button"]').click();
      cy.get('[data-cy="invite-user-autocomplete"]').type(email);

      cy.contains(`${email} has already been invited`).should('exist');
    });

    it('Should not be able to add same user twice', function () {
      cy.resetDB(true);
      const userFirstName = initialDBData.users.user2.firstName;

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(
        userFirstName.substring(0, 5)
      );

      cy.get('#\\:r3f\\:-option-0').click();
      cy.get('[data-cy="invite-user-submit-button"]').click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(
        userFirstName.substring(0, 5)
      );

      cy.contains(`No results found`).should('exist');
    });
  });
});
