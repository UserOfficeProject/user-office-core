declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Assigns the Instrument Scientist role to a user
       *
       * @returns {typeof addScientistRoleToUser}
       * @memberof Chainable
       * @example
       *    cy.addScientistRoleToUser('John')
       */
      addScientistRoleToUser: (user: string) => void;

      /**
       * Lets you change the logged in user's active role
       *
       * @returns {typeof changeActiveRole}
       * @memberof Chainable
       * @example
       *    cy.changeActiveRole('User Officer')
       */
      changeActiveRole: (role: string) => void;

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
    }
  }
}

export {};
