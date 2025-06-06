import { FeatureId } from '@user-office-software-libs/shared-types';

import featureFlags from '../support/featureFlags';
import initialDBData from '../support/initialDBData';

context('Scheduler tests', () => {
  // NOTE: We use fixed dates because we populate the database with a seeder. This is because message broker is not running in test environment.
  const upcoming = initialDBData.experiments.upcoming;
  const upcomingDraft = initialDBData.experiments.upcomingDraft;
  const ended = initialDBData.experiments.ended;
  const completed = initialDBData.experiments.completed;
  const scientist = initialDBData.users.user1;

  beforeEach(function () {
    cy.resetDB(true);
    cy.getAndStoreFeaturesEnabled().then(() => {
      if (!featureFlags.getEnabledFeatures().get(FeatureId.SCHEDULER)) {
        this.skip();
      }
    });

    cy.updateUserRoles({
      id: scientist.id,
      roles: [
        initialDBData.roles.user,
        initialDBData.roles.instrumentScientist,
      ],
    });
    cy.assignScientistsToInstrument({
      instrumentId: initialDBData.instrument1.id,
      scientistIds: [scientist.id],
    });

    cy.login('user1');
    cy.visit('/');
  });

  it('User should not be able to see upcoming experiments in DRAFT state', () => {
    cy.changeActiveRole(initialDBData.roles.user);

    cy.contains('Upcoming experiments');

    cy.contains(upcomingDraft.startsAt).should('not.exist');
    cy.contains(upcomingDraft.endsAt).should('not.exist');

    cy.logout();
  });

  it('User should be able to see upcoming experiments in ACTIVE', () => {
    cy.changeActiveRole(initialDBData.roles.user);

    cy.contains('Upcoming experiments').should('exist');

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('User should be able to see upcoming experiments in COMPLETED', () => {
    cy.changeActiveRole(initialDBData.roles.user);

    cy.contains('Upcoming experiments').should('exist');

    cy.contains(completed.startsAt);
    cy.contains(completed.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('User should be able to see past and upcoming experiments', () => {
    cy.changeActiveRole(initialDBData.roles.user);

    cy.contains('Experiment Times').click();
    cy.finishedLoading();

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);
    cy.contains(completed.startsAt);
    cy.contains(completed.endsAt);

    cy.contains(ended.startsAt);
    cy.contains(ended.endsAt);
  });
});
