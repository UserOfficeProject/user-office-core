import { faker } from '@faker-js/faker';
import { FeatureId } from '@user-office-software-libs/shared-types';
import { DateTime } from 'luxon';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';
import { TestUserId } from './../support/user';

context('Event log tests', () => {
  beforeEach(() => {
    cy.getAndStoreFeaturesEnabled();
    cy.resetDB();
  });

  describe('Proposal event logs', () => {
    let createdProposalPk: number;

    beforeEach(() => {
      cy.login('user1');
      cy.createProposal({ callId: initialDBData.call.id }).then((response) => {
        if (response.createProposal.proposal) {
          createdProposalPk = response.createProposal.proposal.primaryKey;
        }
      });
    });

    it('If user creates a proposal, officer should be able to see the event logs for that proposal', () => {
      cy.login('officer');
      cy.visit('/');

      cy.get("[data-cy='view-proposal']").first().click();
      cy.contains('Logs').click({ force: true });
      cy.contains('PROPOSAL_CREATED');

      cy.closeModal();

      cy.updateProposal({
        title: faker.random.words(2),
        abstract: faker.random.words(5),
        proposalPk: createdProposalPk,
      });

      cy.get("[data-cy='view-proposal']").first().click();
      cy.contains('Logs').click({ force: true });
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
        nationality: 1,
        birthdate: new Date('2000/01/01'),
        organisation: 1,
        department: 'IT',
        position: 'Dirrector',
        email: faker.internet.email(),
        telephone: '555-123-4567',
        organizationCountry: 1,
      });

      cy.login('officer');
      cy.visit('/');

      cy.contains('People').click();

      cy.get('[aria-label="Search"]').type(user.lastName);

      cy.contains(user.firstName)
        .parent()
        .find('button[aria-label="Edit user"]')
        .click();

      cy.get("[name='firstname']").should('have.value', newFirstName);

      cy.contains('Logs').click();

      cy.get('[data-cy="event-logs-table"]').as('eventLogsTable');
      cy.get('@eventLogsTable')
        .find('tr[level="0"]')
        .last()
        .as('eventLogsTableLastRow');

      cy.get('@eventLogsTableLastRow').invoke('text').as('lastRowText');

      cy.get('@lastRowText').should('contain', 'USER_UPDATED');
      cy.get('@lastRowText').should('contain', updateProfileDate);
    });
  });
});
