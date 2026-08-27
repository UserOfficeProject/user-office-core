import {
  GetEmailTemplateQuery,
  GetEmailTemplateQueryVariables,
  GetStatusActionsLogsQuery,
  GetStatusActionsLogsQueryVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const navigateToStatusActionLogsSubmenu = (submenuName: string) => {
  cy.get('body').then(($body) => {
    if ($body.find(`[aria-label='${submenuName}']`).length) {
      cy.get(`[aria-label='${submenuName}']`).children().first().click();
    } else {
      cy.get('[aria-label="Status Action Logs"]').click();
      cy.get(`[aria-label='${submenuName}']`).children().first().click();
    }
  });
};

const getEmailTemplate = (
  getEmailTemplatesInput: GetEmailTemplateQueryVariables
): Cypress.Chainable<GetEmailTemplateQuery> => {
  const api = getE2EApi();
  const request = api.getEmailTemplate(getEmailTemplatesInput);

  return cy.wrap(request);
};

const getStatusActionsLogs = (
  getStatusActionsLogsInput: GetStatusActionsLogsQueryVariables
): Cypress.Chainable<GetStatusActionsLogsQuery> => {
  const api = getE2EApi();
  const request = api.getStatusActionsLogs(getStatusActionsLogsInput);

  return cy.wrap(request);
};

Cypress.Commands.add(
  'navigateToStatusActionLogsSubmenu',
  navigateToStatusActionLogsSubmenu
);

Cypress.Commands.add('getEmailTemplate', getEmailTemplate);

Cypress.Commands.add('getStatusActionsLogs', getStatusActionsLogs);
