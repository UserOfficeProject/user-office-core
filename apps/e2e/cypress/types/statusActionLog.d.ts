import {
  GetEmailTemplateQuery,
  GetStatusActionsLogsQuery,
  GetStatusActionsLogsQueryVariables,
} from '@user-office-software-libs/shared-types';

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

      /**
       * Gets status actions logs
       *
       * @returns {typeof getStatusActionsLogs}
       * @memberof Chainable
       * @example
       *    cy.getStatusActionsLogs(getStatusActionsLogsInput: GetStatusActionsLogsQueryVariables)
       */
      getStatusActionsLogs: (
        getStatusActionsLogsInput: GetStatusActionsLogsQueryVariables
      ) => Cypress.Chainable<GetStatusActionsLogsQuery>;
    }
  }
}

export {};
