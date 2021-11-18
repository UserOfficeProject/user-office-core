import {
  LoginMutation,
  SelectRoleMutationVariables,
  UpdateUserRolesMutationVariables,
  UpdateUserMutationVariables,
  UpdateUserMutation,
  CreateUserMutationVariables,
  CreateUserMutation,
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
      login: (
        roleOrCredentials:
          | 'user'
          | 'officer'
          | 'user2'
          | 'placeholderUser'
          | { email: string; password: string }
      ) => Cypress.Chainable<LoginMutation>;

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
       * Crete user
       *
       * @returns {typeof createUser}
       * @memberof Chainable
       * @example
       *    cy.createUser(createUserInput: CreateUserMutationVariables)
       */
      createUser: (
        createUserInput: CreateUserMutationVariables
      ) => Cypress.Chainable<CreateUserMutation>;
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
       * Update user details
       *
       * @returns {typeof updateUserDetails}
       * @memberof Chainable
       * @example
       *    cy.updateUserDetails(updateUserInput: UpdateUserMutationVariables)
       */
      updateUserDetails: (
        updateUserInput: UpdateUserMutationVariables
      ) => Cypress.Chainable<UpdateUserMutation>;

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
