import { faker } from '@faker-js/faker';
import {
  FeatureId,
  FeatureUpdateAction,
} from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

/*
 * Tests relating to the InviteUser component that is
 * currently used when adding co-proposers.
 */
context('Invites tests', () => {
  describe('Creating invites', () => {
    beforeEach(() => {
      cy.resetDB();
      cy.updateFeature({
        action: FeatureUpdateAction.DISABLE,
        featureIds: [FeatureId.EMAIL_INVITE_LEGACY],
      });
      cy.getAndStoreFeaturesEnabled();
    });

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

    it('Should be able to add user by knowing exact email', function () {
      const lastName = initialDBData.users.user2.lastName;
      const email = initialDBData.users.user2.email;

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[role=presentation]').contains(lastName).click();
      cy.get('.MuiChip-label').should('not.exist');

      cy.get('[data-cy="invite-user-submit-button"]')
        .should('be.enabled')
        .click();
      cy.get('[data-cy="co-proposers"]').contains(lastName);
    });

    it('Should not be able to invite same email twice', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }

      const email = faker.internet.email();

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
  });

  describe('Accepting invites', () => {
    beforeEach(() => {
      cy.resetDB(true);
      cy.updateFeature({
        action: FeatureUpdateAction.DISABLE,
        featureIds: [FeatureId.EMAIL_INVITE_LEGACY],
      });
      cy.getAndStoreFeaturesEnabled();
    });

    it('Should be able to accept invite', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }
      cy.setCoProposerInvites({
        emails: [faker.internet.email()],
        proposalPk: 1,
      }).then((response) => {
        cy.login('user3', initialDBData.roles.user);
        cy.visit('/');
        cy.get('[data-cy=join-proposal-btn]').click();
        cy.get('#code').type(response.setCoProposerInvites[0].code ?? '');
        cy.get('[data-cy="invitation-submit"]').click();
        cy.get('[data-testid="VisibilityIcon"]').click();
        cy.get('.MuiTabs-flexContainer > #horizontal-tab-1').click();
        cy.get('[data-cy=questionary-details-view]').should(
          'contain.text',
          initialDBData.users.user3.lastName
        );
      });
    });
  });

  describe('Adding co-proposers', () => {
    beforeEach(() => {
      cy.resetDB();
      cy.updateFeature({
        action: FeatureUpdateAction.DISABLE,
        featureIds: [FeatureId.EMAIL_INVITE_LEGACY],
      });
      cy.getAndStoreFeaturesEnabled();

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
    });

    it('Should show previous collaborators', function () {
      const lastName = initialDBData.users.user2.lastName;
      const email = initialDBData.users.user2.email;

      cy.get('[data-cy="add-participant-button"]').click();
      cy.get('[role=presentation]').should('not.contain', lastName);

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[role=presentation]').contains(lastName).click();
      cy.get('[data-cy="invite-user-submit-button"]')
        .should('be.enabled')
        .click();

      cy.get('#title-input').type(faker.lorem.words(2));
      cy.get('#abstract-input').type(faker.lorem.words(3));

      cy.get('[data-cy="save-and-continue-button"]').click();
      cy.notification({ variant: 'success', text: 'Saved' });

      cy.contains('Submit').click();
      cy.get('[data-cy=confirm-ok]').click();

      cy.contains('Dashboard').click();

      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy=add-participant-button]').click();
      cy.get('[data-cy="invite-user-autocomplete"]').click();

      cy.get('[role=presentation]').contains(lastName);
    });

    it('Should not be able to add duplicate co-proposer in modal', () => {
      const lastName = initialDBData.users.user2.lastName;
      const email = initialDBData.users.user2.email;

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[role=presentation]').contains(lastName).click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[role=presentation]')
        .contains(`No results found for "${email}"`)
        .should('exist');
    });

    it('Should not be able to add duplicate co-proposer already on proposal', () => {
      const lastName = initialDBData.users.user2.lastName;
      const email = initialDBData.users.user2.email;

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[role=presentation]').contains(lastName).click();
      cy.get('[data-cy="invite-user-submit-button"]')
        .should('be.enabled')
        .click();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[role=presentation]')
        .contains(`No results found for "${email}"`)
        .should('exist');
    });

    it('Should not be able to add duplicate co-proposer when co-proposer is PI', () => {
      const email = initialDBData.users.user1.email;

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[role=presentation]')
        .contains(`No results found for "${email}"`)
        .should('exist');
    });
  });

  describe('Invites disabled with email search enabled', () => {
    beforeEach(() => {
      cy.resetDB(true);
      cy.updateFeature({
        action: FeatureUpdateAction.DISABLE,
        featureIds: [FeatureId.EMAIL_INVITE_LEGACY],
      });
      cy.updateFeature({
        action: FeatureUpdateAction.DISABLE,
        featureIds: [FeatureId.EMAIL_INVITE],
      });
      cy.updateFeature({
        action: FeatureUpdateAction.ENABLE,
        featureIds: [FeatureId.EMAIL_SEARCH],
      });
      cy.getAndStoreFeaturesEnabled();

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
    });

    it('Should be able to add user by knowing exact email', function () {
      const lastName = initialDBData.users.user2.lastName;
      const email = initialDBData.users.user2.email;

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[role=presentation]').contains(lastName).click();

      cy.get('[data-cy="invite-user-submit-button"]')
        .should('be.enabled')
        .click();

      cy.get('[data-cy="co-proposers"]').contains(lastName);
    });

    it('Should not be able to use partial user lookup', function () {
      const name = initialDBData.users.user2.lastName;
      const partialName = name.substring(0, 3);

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(partialName);
      cy.get('[role=presentation]').contains('Enter a full email address');
    });

    it('Should not be able to add an email address when the user does not exist', function () {
      const email = 'unknown-user@email.com';

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[role=presentation]').contains(`No results found for "${email}"`);

      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');
      cy.get('[role=presentation]').contains(`No results found for "${email}"`);
      cy.get('[data-cy="invite-user-submit-button"]').should('be.disabled');
      cy.get('.MuiChip-label').should('not.exist');
    });
  });
});
