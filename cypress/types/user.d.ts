import {
  SelectRoleMutationVariables,
  UpdateUserRolesMutationVariables,
} from '../../src/generated/sdk';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in user with provided credentials
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login('user')
       */
      login: (role: string | { email: string; password: string }) => void;

      /**
       * Logs user out
       *
       * @returns {typeof logout}
       * @memberof Chainable
       * @example
       *    cy.logout()
       */
      logout: () => void;

      /**
       * Update user roles
       *
       * @returns {typeof updateUserRoles}
       * @memberof Chainable
       * @example
       *    cy.updateUserRoles(updateUserRolesInput: UpdateUserRolesMutationVariables)
       */
      updateUserRoles: (
        updateUserRolesInput: UpdateUserRolesMutationVariables
      ) => void;

      /**
       * Lets you change the logged in user's active role
       *
       * @returns {typeof changeActiveRole}
       * @memberof Chainable
       * @example
       *    cy.changeActiveRole(selectRoleInput: SelectRoleMutationVariables)
       */
      changeActiveRole: (selectRoleInput: SelectRoleMutationVariables) => void;
    }
  }
}

export {};
