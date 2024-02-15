import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Experiments tests', () => {
  beforeEach(function () {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled().then(() => {
      // NOTE: We can check features after they are stored to the local storage
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
        this.skip();
      }
    });

    cy.viewport(1920, 1080);
    // TODO: Check this if it doesn;t require the proposal to be assigned to instrument first
    cy.updateProposalManagementDecision({
      proposalPk: initialDBData.proposal.id,
      statusId: 1,
      managementTimeAllocations: [
        { instrumentId: initialDBData.instrument1.id, value: 5 },
      ],
      managementDecisionSubmitted: true,
    });
    cy.createEsi({
      scheduledEventId: initialDBData.scheduledEvents.upcoming.id,
    });
    cy.createVisit({
      scheduledEventId: initialDBData.scheduledEvents.upcoming.id,
      team: [initialDBData.users.user1.id],
      teamLeadUserId: initialDBData.users.user1.id,
    });
  });

  describe('Experiments tests', () => {
    it('Can filter by call and instrument', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();
      cy.finishedLoading();
      cy.get('button[value=NONE]').click();

      cy.get('[data-cy=call-filter]').click();
      cy.get('[role=presentation]').contains('call 1').click();
      cy.contains('1-4 of 4');

      cy.get('[data-cy=instrument-filter]').click();
      cy.get('[role=presentation]').contains('Instrument 3').click();
      cy.contains('0-0 of 0');

      cy.get('[data-cy=instrument-filter]').click();
      cy.get('[role=presentation]').contains('Instrument 2').click();
      cy.contains('0-0 of 0');

      cy.get('[data-cy=instrument-filter]').click();
      cy.get('[role=presentation]').contains('Instrument 1').click();
      cy.contains('1-4 of 4');
    });

    it('Can filter by date', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();

      cy.get('[value=TODAY]').click();
      cy.contains('0-0 of 0');

      cy.get('[value=NONE]').click();
      cy.contains('1-4 of 4');
    });

    it('Can view ESI', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();
      cy.get('[value=NONE]').click();

      cy.get('[data-cy=officer-scheduled-events-table]')
        .contains('View ESI')
        .click();
      cy.get('[role=dialog]').contains(initialDBData.proposal.title);
    });

    it('Can view visits', () => {
      cy.login('officer');
      cy.visit('/');
      cy.get('[data-cy=officer-menu-items]').contains('Experiments').click();
      cy.get('[value=NONE]').click();

      cy.finishedLoading();

      cy.get('[data-cy=officer-scheduled-events-table] Table button')
        .first()
        .click();
      cy.get('[data-cy=officer-scheduled-events-table]').contains(
        initialDBData.users.user1.lastName
      );
    });
  });
});
