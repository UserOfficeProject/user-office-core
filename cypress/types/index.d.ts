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
      expandTemplatesSubmenu: () => void;
    }
  }

  interface Window {
    tinyMCE: any;
  }
}

export {};
