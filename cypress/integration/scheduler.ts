import { GraphQLClient } from 'graphql-request';
import faker from 'faker';

context('Scheduler tests', () => {
  const futureDate = faker.date.future().toISOString().split('T')[0];
  const pastDate = faker.date.past().toISOString().split('T')[0];

  const upcoming = {
    startsAt: `${futureDate} 10:00`,
    endsAt: `${futureDate} 11:00`,
  };
  const ended = {
    startsAt: `${pastDate} 10:00`,
    endsAt: `${pastDate} 11:00`,
  };

  const instrument = {
    name: faker.random.words(2),
    shortCode: faker.random.alphaNumeric(15),
    description: faker.random.words(5),
  };

  const scientist = 'Carl';

  const proposalTitle = faker.random.words(2);

  let firstScheduledEventId: number;
  let secondScheduledEventId: number;

  before(() => {
    cy.resetDB();
    cy.resetSchedulerDB(true);
    cy.viewport(1920, 1080);

    cy.login('user');
    cy.createProposal(proposalTitle);
    cy.logout();

    cy.login('officer');

    cy.contains('People').click();
    cy.addScientistRoleToUser(scientist);

    cy.createInstrument(instrument, scientist);

    cy.contains('Instruments').click();
    cy.assignScientistsToInstrument(instrument.shortCode);

    cy.contains('Calls').click();
    cy.assignInstrumentToCall('call 1', instrument.shortCode);

    cy.contains('Proposals').click();
    cy.assignInstrumentToProposal(proposalTitle, instrument.name);

    cy.logout();
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  after(() => {
    cy.resetSchedulerDB();
  });

  it('User should not be able to see upcoming experiments if there is none', () => {
    cy.login('user');
    cy.contains('Dashboard').click();
    cy.finishedLoading();

    cy.contains('Upcoming experiments').should('not.exist');
    cy.logout();
  });

  it('User should not be able to see upcoming experiments in DRAFT state', () => {
    cy.createScheduledEvent(1, {
      startsAt: upcoming.startsAt,
      endsAt: upcoming.endsAt,
    }).then((data: any) => {
      firstScheduledEventId = data.data.createScheduledEvent.scheduledEvent.id;
    });
    cy.createScheduledEvent(1, {
      startsAt: ended.startsAt,
      endsAt: ended.endsAt,
    }).then((data: any) => {
      secondScheduledEventId = data.data.createScheduledEvent.scheduledEvent.id;
    });

    cy.login('user');

    cy.contains('Upcoming experiments').should('not.exist');

    cy.contains(upcoming.startsAt).should('not.exist');
    cy.contains(upcoming.endsAt).should('not.exist');

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('Instrument scientist should not be able to see upcoming experiments in DRAFT state', () => {
    cy.login('user');
    cy.changeActiveRole('Instrument Scientist');
    cy.finishedLoading();

    cy.finishedLoading();
    cy.contains('Upcoming experiments').click();

    cy.contains('No records to display');
  });

  it('User should be able to see upcoming experiments in ACTIVE', () => {
    cy.activateScheduledEvent(firstScheduledEventId);
    cy.activateScheduledEvent(secondScheduledEventId);

    cy.login('user');

    cy.contains('Upcoming experiments').should('exist');

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('Instrument scientist should be able to see upcoming experiments in ACTIVE', () => {
    cy.login('user');
    cy.changeActiveRole('Instrument Scientist');

    cy.finishedLoading();
    cy.contains('Upcoming experiments').click();

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('User should be able to see upcoming experiments in COMPLETE', () => {
    const query = `
      mutation finalizeProposalBooking($id: Int!, $action: ProposalBookingFinalizeAction!) {
          finalizeProposalBooking(id: $id, action: $action) {
            error
          }
        }
      `;
    const authHeader = `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`;
    const request = new GraphQLClient('/graphql', {
      headers: { authorization: authHeader },
    }).rawRequest(query, {
      id: 1,
      action: 'COMPLETE',
    });

    cy.wrap(request);

    cy.login('user');

    cy.contains('Upcoming experiments').should('exist');

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('Instrument scientist should be able to see upcoming experiments in CLOSED', () => {
    cy.login('user');
    cy.changeActiveRole('Instrument Scientist');

    cy.finishedLoading();
    cy.contains('Upcoming experiments').click();

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('User should be able to see past and upcoming experiments', () => {
    cy.login('user');

    cy.contains('Experiment Times').click();
    cy.finishedLoading();

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt);
    cy.contains(ended.endsAt);
  });
});
