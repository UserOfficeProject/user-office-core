import { GraphQLClient } from 'graphql-request';

const createScheduledEvent = (proposalBookingId, date) => {
  const authHeader = `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`;

  const createEventQuery = `
        mutation createScheduledEvent($input: NewScheduledEventInput!) {
          createScheduledEvent(newScheduledEvent: $input) {
            error
            scheduledEvent {
              id
            }
          }
        }
        `;

  const createEventReq = new GraphQLClient('/graphql', {
    headers: { authorization: authHeader },
  }).rawRequest(createEventQuery, {
    input: {
      proposalBookingId: proposalBookingId,
      startsAt: `${date.startsAt}:00`,
      endsAt: `${date.endsAt}:00`,
      bookingType: 'USER_OPERATIONS',
      instrumentId: 1,
    },
  });

  cy.wrap(createEventReq);
};

const activateScheduledEvent = (scheduledEventId) => {
  const authHeader = `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`;

  const activateScheduledEventQuery = `
      mutation activateScheduledEvent($input: ActivateScheduledEventInput!) {
          activateScheduledEvent(activateScheduledEvent: $input) {
            error
          }
        }
      `;

  const activateScheduledEventReq = new GraphQLClient('/graphql', {
    headers: { authorization: authHeader },
  }).rawRequest(activateScheduledEventQuery, {
    input: {
      id: scheduledEventId,
    },
  });

  cy.wrap(activateScheduledEventReq);
};

Cypress.Commands.add('createScheduledEvent', createScheduledEvent);
Cypress.Commands.add('activateScheduledEvent', activateScheduledEvent);
