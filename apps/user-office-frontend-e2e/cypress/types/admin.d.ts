import {
  GetSettingsQuery,
  PrepareDbMutation,
} from '@user-office-software-libs/shared-types';

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
      resetDB: (includeSeeds?: boolean) => Cypress.Chainable<PrepareDbMutation>;
      /**
       * Gets app settings and stores in the localStorage to be used inside tests.
       *
       * @returns {typeof getAndStoreAppSettings}
       * @memberof Chainable
       * @example
       *    cy.getAndStoreAppSettings()
       */
      getAndStoreAppSettings: () => Cypress.Chainable<GetSettingsQuery>;
    }
  }
}

export {};
