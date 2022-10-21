import {
  CreatePredefinedMessageMutation,
  CreatePredefinedMessageInput,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates new predefined message with values passed. You need to be logged in as user officer.
       *
       * @returns {typeof createPredefinedMessage}
       * @memberof Chainable
       * @example
       *    cy.createPredefinedMessage({title: 'Test message 1', message: 'Test message 1', key: 'manager'})
       */
      createPredefinedMessage: (
        newPredefinedMessageInput: CreatePredefinedMessageInput
      ) => Cypress.Chainable<CreatePredefinedMessageMutation>;
    }
  }
}

export {};
