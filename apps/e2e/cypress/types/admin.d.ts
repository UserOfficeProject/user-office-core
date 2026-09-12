import {
  GetSettingsQuery,
  PrepareDbMutation,
  SetPageContentMutation,
  SetPageContentMutationVariables,
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
      /**
       * Sets the content of one of the admin-authored pages, as the user officer would.
       *
       * @returns {typeof setPageContent}
       * @memberof Chainable
       * @example
       *    cy.setPageContent({ id: PageName.HOMEPAGE, text: '<p>Notice</p>' })
       */
      setPageContent: (
        setPageContentInput: SetPageContentMutationVariables
      ) => Cypress.Chainable<SetPageContentMutation>;
    }
  }
}

export {};
