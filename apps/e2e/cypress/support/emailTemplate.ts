import {
  CreateEmailTemplateMutation,
  CreateEmailTemplateMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const api = getE2EApi();

function createEmailTemplate(
  createEmailTemplateInput: CreateEmailTemplateMutationVariables
): Cypress.Chainable<CreateEmailTemplateMutation> {
  const request = api.createEmailTemplate(createEmailTemplateInput);

  return cy.wrap(request);
}

Cypress.Commands.add('createEmailTemplate', createEmailTemplate);
