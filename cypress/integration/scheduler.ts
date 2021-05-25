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

  before(() => {
    cy.resetDB();
    cy.resetSchedulerDB(true);

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

  it('User should not be able to see upcoming beam times if there is none', () => {
    cy.login('user');
    cy.contains('Dashboard').click();
    cy.finishedLoading();

    cy.contains('Upcoming beam times').should('not.exist');
    cy.logout();
  });

  it('User should not be able to see upcoming beam times in DRAFT state', () => {
    const query = `
      mutation bulkUpsertScheduledEvents($input: BulkUpsertScheduledEventsInput!) {
        bulkUpsertScheduledEvents(bulkUpsertScheduledEvents: $input) {
          error
        }
      }
      `;
    const authHeader = `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`;
    const request = new GraphQLClient('/graphql', {
      headers: { authorization: authHeader },
    }).rawRequest(query, {
      input: {
        proposalBookingId: 1,
        scheduledEvents: [
          {
            id: 1,
            newlyCreated: true,
            startsAt: `${upcoming.startsAt}:00`,
            endsAt: `${upcoming.endsAt}:00`,
          },
          {
            id: 2,
            newlyCreated: true,
            startsAt: `${ended.startsAt}:00`,
            endsAt: `${ended.endsAt}:00`,
          },
        ],
      },
    });

    cy.wrap(request);

    cy.login('user');

    cy.contains('Upcoming beam times').should('not.exist');

    cy.contains(upcoming.startsAt).should('not.exist');
    cy.contains(upcoming.endsAt).should('not.exist');

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('Instrument scientist should not be able to see upcoming beam times in DRAFT state', () => {
    cy.login('user');
    cy.changeActiveRole('Instrument Scientist');
    cy.finishedLoading();

    cy.finishedLoading();
    cy.contains('Upcoming beam times').click();

    cy.contains('No records to display');
  });

  it('User should be able to see upcoming beam times in BOOKED', () => {
    const query = `
      mutation activateProposalBooking($id: ID!
        ) {
          activateProposalBooking(id: $id) {
            error
          }
        }
      `;
    const authHeader = `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`;
    const request = new GraphQLClient('/graphql', {
      headers: { authorization: authHeader },
    }).rawRequest(query, {
      id: 1,
    });

    cy.wrap(request);

    cy.login('user');

    cy.contains('Upcoming beam times').should('exist');

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('Instrument scientist should be able to see upcoming beam times in BOOKED', () => {
    cy.login('user');
    cy.changeActiveRole('Instrument Scientist');

    cy.finishedLoading();
    cy.contains('Upcoming beam times').click();

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('User should be able to see upcoming beam times in CLOSED', () => {
    const query = `
      mutation finalizeProposalBooking($id: ID!, $action: ProposalBookingFinalizeAction!) {
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
      action: 'CLOSE',
    });

    cy.wrap(request);

    cy.login('user');

    cy.contains('Upcoming beam times').should('exist');

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('Instrument scientist should be able to see upcoming beam times in CLOSED', () => {
    cy.login('user');
    cy.changeActiveRole('Instrument Scientist');

    cy.finishedLoading();
    cy.contains('Upcoming beam times').click();

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt).should('not.exist');
    cy.contains(ended.endsAt).should('not.exist');
    cy.logout();
  });

  it('User should be able to see past and upcoming beam times', () => {
    cy.login('user');

    cy.contains('My beam times').click();
    cy.finishedLoading();

    cy.contains(upcoming.startsAt);
    cy.contains(upcoming.endsAt);

    cy.contains(ended.startsAt);
    cy.contains(ended.endsAt);
  });
});
