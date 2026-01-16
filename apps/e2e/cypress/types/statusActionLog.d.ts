import { GetEmailTemplateQuery } from '@user-office-software-libs/shared-types';

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

      /**
       * Gets email template
       *
       * @returns {typeof getEmailTemplate}
       * @memberof Chainable
       * @example
       *    cy.getProposals(getProposalsInput: GetProposalsQueryVariables)
       */
      getEmailTemplate: (
        getEmailTemplatesInput: GetEmailTemplateQueryVariables
      ) => Cypress.Chainable<GetEmailTemplateQuery>;
    }
  }
}

export {};
