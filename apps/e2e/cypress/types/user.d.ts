import {
  ExternalTokenLoginMutation,
  UpdateUserRolesMutationVariables,
  UpdateUserMutationVariables,
  UpdateUserMutation,
  CreateUserByEmailInviteMutationVariables,
  CreateUserByEmailInviteMutation,
} from '@user-office-software-libs/shared-types';

import { TestUserId } from './../support/user';

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
        idOrCredentials: TestUserId | { email: string; password: string },
        role?: number
      ) => Cypress.Chainable<ExternalTokenLoginMutation>;

      /**
       * Gets settings
       *
       * @returns {typeof getSettings}
       * @memberof Chainable
       * @example
       *    cy.getSettings(SettingsId.ABC)
       */

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
       * Create user by email invite
       *
       * @returns {typeof createUserByEmailInvite}
       * @memberof Chainable
       * @example
       *    cy.createUserByEmailInvite(createUserByEmailInviteInput: CreateUserByEmailInviteMutationVariables)
       */
      createUserByEmailInvite: (
        createUserByEmailInviteInput: CreateUserByEmailInviteMutationVariables
      ) => Cypress.Chainable<CreateUserByEmailInviteMutation>;
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
       *    cy.changeActiveRole(selectedRoleId: number)
       */
      changeActiveRole: (selectedRoleId: number) => void;

      /**
       * Gets app features and stores in the localStorage to be used inside tests.
       *
       * @returns {typeof getAndStoreFeaturesEnabled}
       * @memberof Chainable
       * @example
       *    cy.getAndStoreFeaturesEnabled()
       */
      getAndStoreFeaturesEnabled: () => Cypress.Chainable<GetFeaturesQuery>;
    }
  }
}

export {};
