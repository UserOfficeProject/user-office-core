import {
  UpdateUserMutationVariables,
  User,
} from '@user-office-software-libs/shared-types';
import faker from 'faker';
import { DateTime } from 'luxon';

import initialDBData from '../support/initialDBData';

context('Event log tests', () => {
  beforeEach(() => {
    cy.resetDB();
  });

  describe('Proposal event logs', () => {
    let createdProposalPk: number;

    beforeEach(() => {
      cy.login('user');
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
    beforeEach(() => {
      cy.login('user');
    });

    it('If user uptates his info, officer should be able to see the event logs for that update', () => {
      const newFirstName = faker.name.firstName();
      // NOTE: Hour date format is enough because we don't know the exact time in seconds and minutes when update will happen in the database.
      const updateProfileDate = DateTime.now().toFormat(
        initialDBData.getFormats().dateFormat + ' HH'
      );
      const loggedInUser = window.localStorage.getItem('user');

      if (!loggedInUser) {
        throw new Error('No logged in user');
      }

      const loggedInUserParsed = JSON.parse(loggedInUser) as User;

      cy.updateUserDetails({
        ...loggedInUserParsed,
        firstname: newFirstName,
      } as UpdateUserMutationVariables);

      cy.login('officer');
      cy.visit('/');

      cy.contains('People').click();

      cy.get('[aria-label="Search"]').type(loggedInUserParsed.lastname);

      cy.contains(loggedInUserParsed.lastname)
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
