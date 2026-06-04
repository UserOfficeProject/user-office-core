import {
  AssignCallsToTagMutation,
  AssignCallsToTagMutationVariables,
  CreateTagMutation,
  CreateTagMutationVariables,
  AssignUsersToTagMutationVariables,
  AssignUsersToTagMutation,
  AssignInstrumentsToTagMutationVariables,
  AssignInstrumentsToTagMutation,
  UpdateRoleTagsMutation,
  UpdateRoleTagsMutationVariables,
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

      /**
       * Assign calls to a tag
       *
       * @returns {typeof AssignCallsToTagMutation}
       * @memberof Chainable
       * @example
       *    cy.assignCallsToTag({ callIds: [1], tagId: 1 })
       */
      assignCallsToTag: (
        assignCallsInput: AssignCallsToTagMutationVariables
      ) => Cypress.Chainable<AssignCallsToTagMutation>;

      /**
       * Update tags assigned to a role
       *
       * @returns {typeof UpdateRoleTagsMutation}
       * @memberof Chainable
       * @example
       *    cy.updateRoleTags({ roleId: 11, tagIds: [1] })
       */
      updateRoleTags: (
        updateRoleTagsInput: UpdateRoleTagsMutationVariables
      ) => Cypress.Chainable<UpdateRoleTagsMutation>;
    }
  }
}

export {};
