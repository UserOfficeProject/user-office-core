import {
  CreateEmailTemplateMutation,
  CreateEmailTemplateMutationVariables,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates a new email template with the given values
       *
       * @returns {typeof createEmailTemplateMutation}
       * @memberof Chainable
       * @example
       *    cy.createEmailTemplate({
       *      name: faker.lorem.words(2),
       *      shortCode: faker.string.alphanumeric(15),
       *      description: faker.lorem.words(5),
       *      managerUserId: 1
       *    });
       */
      createEmailTemplate(
        createEmailTemplateInput: CreateEmailTemplateMutationVariables
      ): Cypress.Chainable<CreateEmailTemplateMutation>;
    }
  }
}

export {};
