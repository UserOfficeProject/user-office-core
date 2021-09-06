import faker from 'faker';
import { GraphQLClient } from 'graphql-request';

const createScheduledEvent = (proposalBookingId, date) => {
  const authHeader = `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`;

  const createEventQuery = `
        mutation bulkUpsertScheduledEvents($input: BulkUpsertScheduledEventsInput!) {
          bulkUpsertScheduledEvents(bulkUpsertScheduledEvents: $input) {
            error
          }
        }
        `;

  const createEventReq = new GraphQLClient('/graphql', {
    headers: { authorization: authHeader },
  }).rawRequest(createEventQuery, {
    input: {
      proposalBookingId: proposalBookingId,
      scheduledEvents: [
        {
          id: 1,
          newlyCreated: true,
          startsAt: `${date.startsAt}:00`,
          endsAt: `${date.endsAt}:00`,
        },
      ],
    },
  });

  cy.wrap(createEventReq);
};

const activateBooking = (proposalBookingId) => {
  const authHeader = `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`;

  const activateBookingQuery = `
      mutation activateProposalBooking($id: Int!
        ) {
          activateProposalBooking(id: $id) {
            error
          }
        }
      `;

  const activateBookingReq = new GraphQLClient('/graphql', {
    headers: { authorization: authHeader },
  }).rawRequest(activateBookingQuery, {
    id: proposalBookingId,
  });

  cy.wrap(activateBookingReq);
};

Cypress.Commands.add('createScheduledEvent', createScheduledEvent);
Cypress.Commands.add('activateBooking', activateBooking);
