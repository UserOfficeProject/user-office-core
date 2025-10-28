import {
  CreateTagMutation,
  CreateTagMutationVariables,
  AssignUsersToTagMutationVariables,
  AssignUsersToTagMutation,
  AssignInstrumentsToTagMutationVariables,
  AssignInstrumentsToTagMutation,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Create a tag
       *
       * @returns {typeof CreateTagMutation}
       * @memberof Chainable
       * @example
       *    cy.ceateTag({ name: 'name', shortCode: 'shortCode' })
       */
      createTag: (
        updateTagInput: CreateTagMutationVariables
      ) => Cypress.Chainable<CreateTagMutation>;

      /**
       * Add User to a tag
       *
       * @returns {typeof AssignUsersToTagMutation}
       * @memberof Chainable
       * @example
       *    cy.addUserToTag({ userIds: [1], tagId: [1] })
       */
      addUserToTag: (
        updateTagInput: AssignUsersToTagMutationVariables
      ) => Cypress.Chainable<AssignUsersToTagMutation>;

      /**
       * Add Instrument  to a tag
       *
       * @returns {typeof AssignInstrumentsToTagMutation}
       * @memberof Chainable
       * @example
       *    cy.addInstrumentToTag({ instrumentIds: [1], tagId: [1] })
       */
      addInstrumentToTag: (
        updateTagInput: AssignInstrumentsToTagMutationVariables
      ) => Cypress.Chainable<AssignInstrumentsToTagMutation>;
    }
  }
}

export {};
