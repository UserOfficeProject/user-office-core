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
       *      name: faker.random.words(2),
       *      shortCode: faker.random.alphaNumeric(15),
       *      description: faker.random.words(5),
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
