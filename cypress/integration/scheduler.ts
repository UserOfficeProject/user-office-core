import { GraphQLClient } from 'graphql-request';
import faker from 'faker';

context('Scheduler tests', () => {
  before(() => {
    cy.resetDB();
    cy.resetSchedulerDB(true);
  });

  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1100, 1000);
  });

  after(() => {
    cy.resetSchedulerDB();
  });

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

  it('User should not be able to see upcoming beam times if there is none', () => {
    cy.login('user');
    cy.createProposal();

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
