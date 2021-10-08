declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Resets database.
       *
       * @returns {typeof resetDB}
       * @memberof Chainable
       * @example
       *    cy.resetDB()
       */
      resetDB: (includeSeeds?: boolean) => void;

      /**
       * Resets the scheduler database
       *
       * @returns {typeof resetSchedulerDB}
       * @memberof Chainable
       * @example
       *    cy.resetSchedulerDB()
       */
      resetSchedulerDB: (includeSeeds?: boolean) => void;
    }
  }
}

export {};
