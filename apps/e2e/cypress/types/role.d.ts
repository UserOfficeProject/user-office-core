import {
  CreateRoleMutationVariables,
  CreateRoleMutation,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates new role.
       *
       * @returns {typeof createRole}
       * @memberof Chainable
       * @example
       *    cy.createRole(createRoleInput: CreateRoleMutationVariables)
       */
      createRole: (
        createRoleInput: CreateRoleMutationVariables
      ) => Cypress.Chainable<CreateRoleMutation>;
    }
  }
}
