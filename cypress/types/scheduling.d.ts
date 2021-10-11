declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates new event in scheduler.
       *
       * @returns {typeof createScheduledEvent}
       * @memberof Chainable
       * @example
       * const eventDate = faker.date.future().toISOString().split('T')[0];
       * cy.createScheduledEvent(1, {
       *   startsAt: `${eventDate} 10:00`,
       *   endsAt: `${eventDate} 11:00`,
       * })
       */
      createScheduledEvent: (
        proposalBookingId: number,
        date: { startsAt: string; endsAt: string }
      ) => Promise<void>;

      /**
       * Activates scheduled event in scheduler
       *
       * @returns {typeof activateScheduledEvent}
       * @memberof Chainable
       * @example
       *    cy.activateScheduledEvent(1)
       */
      activateScheduledEvent: (scheduledEventId: number) => Promise<void>;
    }
  }
}

export {};
