import initialDBData from '../support/initialDBData';

context('Scheduler tests', () => {
  // NOTE: We use fixed dates because we populate the database with a seeder. This is because message broker is not running in test environment.
  const upcoming = initialDBData.scheduledEvents.upcoming;
  const upcomingDraft = initialDBData.scheduledEvents.upcomingDraft;
  const ended = initialDBData.scheduledEvents.ended;
  const completed = initialDBData.scheduledEvents.completed;
  const scientist = initialDBData.users.user1;

  beforeEach(() => {
    cy.resetDB(true);
    cy.updateUserRoles({
      id: scientist.id,
      roles: [
        initialDBData.roles.user,
        initialDBData.roles.instrumentScientist,
      ],
    });
    cy.assignScientistsToInstrument({
      instrumentId: initialDBData.instrument2.id,
      scientistIds: [scientist.id],
    });

    cy.assignInstrumentToCall({
      callId: initialDBData.call.id,
      instrumentIds: [initialDBData.instrument2.id],
    });
    cy.assignProposalsToInstrument({
      instrumentId: initialDBData.instrument2.id,
      proposals: [
        {
          callId: initialDBData.call.id,
          primaryKey: initialDBData.proposal.id,
        },
      ],
    });

    cy.login('user');
    cy.visit('/');
  });

  it('User should not be able to see upcoming experiments in DRAFT state', () => {
    cy.contains('Upcoming experiments');

    cy.contains(upcomingDraft.startsAt).should('not.exist');
    cy.contains(upcomingDraft.endsAt).should('not.exist');

    cy.logout();
  });

  it('Instrument scientist should not be able to see upcoming experiments in DRAFT state', () => {
    cy.changeActiveRole(initialDBData.roles.instrumentScientist);
    cy.visit('/');
    cy.finishedLoading();

    cy.contains('Upcoming experiments').click();

    cy.finishedLoading();

    cy.contains(upcomingDraft.startsAt).should('not.exist');
    cy.contains(upcomingDraft.endsAt).should('not.exist');
  });

  it('User should be able to see upcoming experiments in ACTIVE', () => {
    cy.contains('Upcoming experiments').should('exist');

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('Instrument scientist should be able to see upcoming experiments in ACTIVE', () => {
    cy.changeActiveRole(initialDBData.roles.instrumentScientist);
    cy.visit('/');

    cy.finishedLoading();
    cy.contains('Upcoming experiments').click();

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('User should be able to see upcoming experiments in COMPLETED', () => {
    cy.contains('Upcoming experiments').should('exist');

    cy.contains(completed.startsAt);
    cy.contains(completed.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('Instrument scientist should be able to see upcoming experiments in COMPLETED', () => {
    cy.changeActiveRole(initialDBData.roles.instrumentScientist);
    cy.visit('/');

    cy.finishedLoading();
    cy.contains('Upcoming experiments').click();

    cy.contains(completed.startsAt);
    cy.contains(completed.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('User should be able to see past and upcoming experiments', () => {
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
