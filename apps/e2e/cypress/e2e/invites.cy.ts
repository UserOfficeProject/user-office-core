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

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();
    });

    it('Should be able to delete invite', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }

      const email = 'john@example.com';

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.contains(`Invite ${email} via email`).should('exist');
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

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.contains(`Invite ${email} via email`).should('exist');
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

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.contains(`Invite ${email} via email`).should('exist');
      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');

      cy.get('[data-cy="invite-user-submit-button"]').click();
      cy.get('.MuiChip-label').should('have.text', email);
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

      cy.get('[data-cy="invites-chips"]').contains(email).should('not.exist');
      cy.get('[data-cy="co-proposers"]').contains(lastName);
    });

    it('Should not be able to invite email already invited on proposal', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }

      const email = faker.internet.email();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.contains(`Invite ${email} via email`).should('exist');
      cy.get('[data-cy="invite-user-autocomplete"] input').type('{enter}');

      cy.get('[data-cy="invite-user-submit-button"]').click();

      cy.get('[data-cy="add-participant-button"]').click();
      cy.get('[data-cy="invite-user-autocomplete"]').type(email);

      cy.contains(`${email} has already been invited`).should('exist');
      cy.get('[data-cy="invite-user-autocomplete"] input').type('{enter}');
      cy.contains(`${email} has already been invited`).should('exist');

      cy.get('[data-cy="invite-user-autocomplete"] input').should(
        'have.value',
        `${email}`
      );
      cy.get('[data-cy="invite-user-autocomplete"]')
        .find('.MuiChip-label')
        .should('have.length', 0);
    });

    it('Should not be able to invite email already invited in modal', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }

      const email = faker.internet.email();

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.contains(`Invite ${email} via email`).should('exist');
      cy.get('[data-cy="invite-user-autocomplete"] input').type('{enter}');

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.contains(`${email} has already been invited`).should('exist');

      cy.get('[data-cy="invite-user-autocomplete"] input').type('{enter}');
      cy.contains(`${email} has already been invited`).should('exist');

      cy.get('[data-cy="invite-user-autocomplete"] input').should(
        'have.value',
        `${email}`
      );
      cy.get('[data-cy="invite-user-autocomplete"]')
        .find('.MuiChip-label')
        .should('have.length', 1);
    });

    it('Should not be able to invite an email that belongs to a user', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }

      /*
       * When pressing enter quickly after typing an email, it should not invite
       * the user while it is still searching for the user in the background.
       */

      const email = initialDBData.users.user2.email;

      cy.get('[data-cy=add-participant-button]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(`${email}{enter}`);

      cy.get('[data-cy="invite-user-autocomplete"]')
        .find('.MuiChip-label')
        .should('not.exist');
    });

    it.only('Should not be able to invite the email of the current user', function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.EMAIL_INVITE)) {
        this.skip();
      }

      const currentUserEmail = initialDBData.users.user1.email;

      cy.get('[data-cy=add-participant-button]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(
        `${currentUserEmail}`
      );
      cy.contains('Loading...').should('not.exist');
      cy.contains(`${currentUserEmail} has already been invited`).should(
        'exist'
      );

      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');
      cy.contains(`${currentUserEmail} has already been invited`).should(
        'exist'
      );
      cy.get('[data-cy="invite-user-autocomplete"]')
        .find('.MuiChip-label')
        .should('not.exist');
    });

    it('Should not be able to delete added users with backspace', function () {
      const name = initialDBData.users.user2.lastName;
      const email = initialDBData.users.user2.email;
      const threeLetterQuery = 'abc';

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.contains(name);
      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');
      cy.get('.MuiChip-label').should('contain.text', name);

      cy.get('[data-cy="invite-user-autocomplete"]').type(threeLetterQuery);
      cy.get('[data-cy="invite-user-autocomplete"]').type(
        '{backspace}{backspace}{backspace}{backspace}{backspace}'
      ); // 5 backspaces

      cy.get('.MuiChip-label').should('contain.text', name);
      cy.get('[data-cy="invite-user-autocomplete"] input').should('be.empty');
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

  describe('Previous collaborators', () => {
    const prevCollabLastName = initialDBData.users.user2.lastName;

    beforeEach(() => {
      cy.resetDB();
      cy.updateFeature({
        action: FeatureUpdateAction.DISABLE,
        featureIds: [FeatureId.EMAIL_INVITE_LEGACY],
      });
      cy.getAndStoreFeaturesEnabled();

      const email = initialDBData.users.user2.email;

      cy.login('user1', initialDBData.roles.user);
      cy.visit('/');
      cy.contains('New Proposal').click();
      cy.get('[data-cy=call-list]').find('li:first-child').click();

      cy.get('[data-cy="add-participant-button"]').click();
      cy.get('[role=presentation]').should('not.contain', prevCollabLastName);

      cy.get('[data-cy="invite-user-autocomplete"]').type(email);
      cy.get('[role=presentation]').contains(prevCollabLastName).click();
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
    });

    it('Should show previous collaborators', function () {
      cy.get('[data-cy=add-participant-button]').click();
      cy.get('[data-cy="invite-user-autocomplete"]').click();

      cy.get('[role=presentation]').contains(prevCollabLastName);
    });

    it('Should update previous collaborator list after adding', function () {
      cy.get('[data-cy=add-participant-button]').click();
      cy.get('[data-cy="invite-user-autocomplete"]').click();

      cy.get('[role=presentation]').contains(prevCollabLastName);
      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');

      cy.get('[data-cy="invite-user-autocomplete"]').click();
      cy.get('[role="presentation"] ul[role="listbox"]').should('not.exist');
    });

    it('Should not be able to add single previous collaborator multiple times', function () {
      cy.get('[data-cy=add-participant-button]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').click();
      cy.get('[role=presentation]').contains(prevCollabLastName);

      // Pressing enter multiple times quickly
      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');
      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');
      cy.get('[data-cy="invite-user-autocomplete"]').type('{enter}');

      cy.get('[data-cy="invite-user-autocomplete"]')
        .find('.MuiChip-label')
        .should('have.length', 1);

      cy.get('[data-cy="invite-user-autocomplete"]')
        .find('.MuiChip-label')
        .should('contain.text', prevCollabLastName);

      cy.get('[data-cy="invite-user-autocomplete"]').click();
      cy.get('[role="presentation"] ul[role="listbox"]').should('not.exist');
    });

    it('Should not add a previous collaborator when typing quickly and pressing enter', function () {
      const randomSearch = 'abcd';

      cy.get('[data-cy="add-participant-button"]').click();

      cy.get('[data-cy="invite-user-autocomplete"]').type(
        `${randomSearch}{enter}`
      );

      cy.get('.MuiChip-label').should('not.exist');
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

      cy.get('.MuiChip-label').should('not.exist');
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
});
