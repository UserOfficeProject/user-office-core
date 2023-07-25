import {
  ExternalTokenLoginMutation,
  UpdateUserRolesMutationVariables,
  UpdateUserMutationVariables,
  UpdateUserMutation,
  CreateUserMutationVariables,
  CreateUserMutation,
  SetUserEmailVerifiedMutationVariables,
  SetUserEmailVerifiedMutation,
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
       * Set user email verified
       *
       * @returns {typeof setUserEmailVerified}
       * @memberof Chainable
       * @example
       *    cy.setUserEmailVerified(setUserEmailVerifiedInput: SetUserEmailVerifiedMutationVariables)
       */
      setUserEmailVerified: (
        setUserEmailVerifiedInput: SetUserEmailVerifiedMutationVariables
      ) => Cypress.Chainable<SetUserEmailVerifiedMutation>;

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
