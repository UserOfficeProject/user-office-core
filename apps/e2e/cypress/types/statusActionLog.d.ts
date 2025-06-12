declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Expands Status Action Logs submenu
       *
       * @returns {typeof expandStatusActionLogsSubmenu}
       * @memberof Chainable
       * @example
       *    cy.expandStatusActionLogsSubmenu()
       */
      navigateToStatusActionLogsSubmenu: (submenuName: string) => void;
    }
  }
}

export {};
