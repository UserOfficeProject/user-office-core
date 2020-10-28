/**
 * Declare the command types on the global cypress object before you use them.
 * This way we avoid typescript errors and have better overview of the commands.
 */

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
      resetDB: () => void;

      /**
       * Logs in user with provided credentials
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login('user')
       */
      login: (role: string) => void;

      /**
       * Expands templates submenu
       *
       * @returns {typeof expandTemplatesSubmenu}
       * @memberof Chainable
       * @example
       *    cy.expandTemplatesSubmenu()
       */
      navigateToTemplatesSubmenu: (submenuName: string) => void;

      /**
       * Logs user out
       *
       * @returns {typeof logout}
       * @memberof Chainable
       * @example
       *    cy.logout()
       */
      logout: () => void;

      /**
       * Checks for notification with variant text if passed. Default variant is 'success'.
       *
       * @returns {typeof notification}
       * @memberof Chainable
       * @example
       *    cy.notification({ variant: 'error', text: 'failed'})
       */
      notification: (options: { variant: string; text: string }) => void;

      /**
       * Checks if the progressbar does not exist in the dom anymore.
       *
       * @returns {typeof finishedLoading}
       * @memberof Chainable
       * @example
       *    cy.finishedLoading()
       */
      finishedLoading: () => void;

      /**
       * Creates new proposal witn title and abstract passed. If nothing is passed it generates title and abstract on its own. You need to be logged in as a user.
       *
       * @returns {typeof createProposal}
       * @memberof Chainable
       * @example
       *    cy.createProposal('Proposal title', 'Proposal abstract')
       */
      createProposal: (
        proposalTitle?: string,
        proposalAbstract?: string
      ) => void;
    }
  }

  interface Window {
    tinyMCE: any;
  }
}

export {};
