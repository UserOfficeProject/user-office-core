import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';
import { TestUserId } from '../support/user';

context('Event log tests', () => {
  beforeEach(() => {
    cy.resetDB();
    cy.getAndStoreFeaturesEnabled();
  });

  describe('Proposal event logs', () => {
    let createdProposalPk: number;

    beforeEach(() => {
      cy.login('user1');
      cy.createProposal({ callId: initialDBData.call.id }).then((response) => {
        if (response.createProposal) {
          createdProposalPk = response.createProposal.primaryKey;
        }
      });
    });

    it('If user creates a proposal, officer should be able to see the event logs for that proposal', () => {
      cy.login('officer');
      cy.visit('/');

      cy.get("[data-cy='view-proposal']").first().click();
      cy.get('button[role="tab"]').contains('Logs').click({ force: true });
      cy.contains('PROPOSAL_CREATED');

      cy.closeModal();

      cy.updateProposal({
        title: faker.lorem.word(2),
        abstract: faker.lorem.word(5),
        proposalPk: createdProposalPk,
      });

      cy.get("[data-cy='view-proposal']").first().click();
      cy.get('button[role="tab"]').contains('Logs').click({ force: true });
      cy.contains('PROPOSAL_UPDATED');
    });
  });

  describe('User event logs', () => {
    const testUserId: TestUserId = 'user1';
    const user = initialDBData.users[testUserId];
    beforeEach(function () {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.USER_MANAGEMENT)) {
        this.skip();
      }
      cy.login(testUserId);
    });

    it('If user updates his info, officer should be able to see the event logs for that update', () => {
      const newFirstName = faker.name.firstName();
      // NOTE: Hour date format is enough because we don't know the exact time in seconds and minutes when update will happen in the database.
      const updateProfileDate = DateTime.now().toFormat(
        initialDBData.getFormats().dateFormat + ' HH'
      );

      cy.updateUserDetails({
        id: user.id,
        firstname: newFirstName,
        user_title: 'Dr.',
        lastname: 'Doe',
        gender: 'male',
        birthdate: new Date('2000/01/01'),
        institutionId: 1,
        department: 'IT',
        position: 'Dirrector',
        email: faker.internet.email(),
        telephone: '555-123-4567',
      });

      cy.login('officer');
      cy.visit('/People');

      cy.finishedLoading();

      cy.get('[aria-label="Search"]').type(user.lastName);

      cy.contains(user.firstName)
        .parent()
        .find('button[aria-label="Edit user"]')
        .click();

      cy.get("[name='firstname']").should('have.value', newFirstName);

      cy.get('[role="tab"]').contains('Logs').click();

      cy.get('[data-cy="event-logs-table"]').as('eventLogsTable');
      cy.get('@eventLogsTable')
        .find('tr[level="0"]')
        .last()
        .as('eventLogsTableLastRow');

      cy.get('@eventLogsTableLastRow').invoke('text').as('lastRowText');

      cy.get('@lastRowText').should('contain', 'USER_UPDATED');
      cy.get('@lastRowText').should('contain', updateProfileDate);
    });

    it('If user impersonates someone, it reflects in the action logs', () => {
      cy.login('officer');
      cy.visit('/People');

      cy.finishedLoading();

      cy.contains(user.firstName)
        .parent()
        .find('button[aria-label="Edit user"]')
        .click();

      cy.get('.MuiTabs-flexContainer > #horizontal-tab-1').click();
      cy.get('[data-cy="add-role-button"]').click();
      cy.get('input[type="checkbox"]').eq(1).check();
      cy.get('[data-cy="assign-role-to-user"]').click();

      cy.get('.MuiTabs-flexContainer > #horizontal-tab-0').click();
      cy.get('[data-cy="impersonate-user-button"]').click();

      cy.get('[data-cy="profile-page-btn"]').click();
      cy.get('[data-cy="change-roles-button"]').click();
      cy.get('[data-cy="select-role-user_officer"]').click();

      cy.get('[href="/Faps"]').click();
      cy.get('[aria-label="Edit"]').click();
      cy.get('.MuiTabs-flexContainer > #horizontal-tab-1').click();
      cy.get('[data-cy="add-participant-button"]').click();
      cy.get('input[type="checkbox"]').eq(0).check();
      cy.get('[data-cy="assign-selected-users"]').click();
      cy.get('.MuiTabs-flexContainer > #horizontal-tab-6').click();
      cy.contains('userId:2 impersonating userId:1');
    });
  });
});
