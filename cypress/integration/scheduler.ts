context('Scheduler tests', () => {
  // NOTE: We use fixed dates because we populate the database with a seeder. This is because message broker is not running in test environment.
  const upcoming = {
    startsAt: '2023-01-07 10:00',
    endsAt: '2023-01-07 11:00',
  };
  const upcomingDraft = {
    startsAt: '2023-01-07 12:00',
    endsAt: '2023-01-07 13:00',
  };
  const ended = {
    startsAt: '2020-01-07 10:00',
    endsAt: '2020-01-07 11:00',
  };
  const completed = {
    startsAt: '2023-02-07 12:00',
    endsAt: '2023-02-07 13:00',
  };
  const scientist = { firstname: 'Carl', id: 1 };
  const scientistRoleId = 7;
  const userRoleId = 1;
  const existingSeededInstrumentId = 2;
  const existingSeededCallId = 1;
  const existingSeedeProposalId = 1;

  beforeEach(() => {
    cy.resetDB(true);
    cy.resetSchedulerDB(true);
    cy.updateUserRoles({
      id: scientist.id,
      roles: [userRoleId, scientistRoleId],
    });
    cy.assignScientistsToInstrument({
      instrumentId: existingSeededInstrumentId,
      scientistIds: [scientist.id],
    });

    cy.assignInstrumentToCall({
      callId: existingSeededCallId,
      instrumentIds: [existingSeededInstrumentId],
    });
    cy.assignProposalsToInstrument({
      instrumentId: existingSeededInstrumentId,
      proposals: [
        {
          callId: existingSeededCallId,
          primaryKey: existingSeedeProposalId,
        },
      ],
    });
    cy.viewport(1920, 1080);
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
    cy.changeActiveRole(scientistRoleId);
    cy.visit('/');
    cy.finishedLoading();

    cy.contains('Upcoming experiments').click();

    cy.contains('No records to display');
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
    cy.changeActiveRole(scientistRoleId);
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
    cy.changeActiveRole(scientistRoleId);
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
