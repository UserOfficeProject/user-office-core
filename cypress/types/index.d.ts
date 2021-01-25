/**
 * Declare the command types on the global cypress object before you use them.
 * This way we avoid typescript errors and have better overview of the commands.
 */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Resets database.
       *
       * @returns {typeof resetDB}
       * @memberof Chainable
       * @example
       *    cy.resetDB()
       */
      resetDB: () => void;

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
       * Expands templates submenu
       *
       * @returns {typeof expandTemplatesSubmenu}
       * @memberof Chainable
       * @example
       *    cy.expandTemplatesSubmenu()
       */
      navigateToTemplatesSubmenu: (submenuName: string) => void;

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
       * Checks for notification with variant text if passed. Default variant is 'success'.
       *
       * @returns {typeof notification}
       * @memberof Chainable
       * @example
       *    cy.notification({ variant: 'error', text: 'failed'})
       */
      notification: (options: {
        variant: 'success' | 'error' | 'info';
        text: string;
      }) => void;

      /**
       * Checks if the progressbar does not exist in the dom anymore.
       *
       * @returns {typeof finishedLoading}
       * @memberof Chainable
       * @example
       *    cy.finishedLoading()
       */
      finishedLoading: () => void;

      /**
       * Creates new proposal witn title and abstract passed. If nothing is passed it generates title and abstract on its own. You need to be logged in as a user.
       *
       * @returns {typeof createProposal}
       * @memberof Chainable
       * @example
       *    cy.createProposal('Proposal title', 'Proposal abstract')
       */
      createProposal: (
        proposalTitle?: string,
        proposalAbstract?: string
      ) => void;
      /**
       * Moves the element in the given direction with given length.
       * For example direction "left" means that the element will go to the left and length "2" means that two times left arrow will be pressed.
       *
       * @returns {typeof dragElement}
       * @memberof Chainable
       * @example
       *    cy.dragElement([{ direction: 'left', length: 1 }, { direction: 'down', length: 2 }])
       */
      dragElement: (
        arguments: {
          direction: 'left' | 'up' | 'right' | 'down';
          length: number;
        }[]
      ) => Cypress.Chainable<JQuery<HTMLElement>>;

      /**
       * Creates template
       *
       * @returns {typeof createTemplate}
       * @memberof Chainable
       * @example
       *    cy.createTemplate('proposal')
       */
      createTemplate: (
        type: string,
        title?: string,
        description?: string
      ) => void;

      /**
       * Creates topic in template
       *
       * @returns {typeof createTopic}
       * @memberof Chainable
       * @example
       *    cy.createTopic('New topic')
       */
      createTopic: (topic: string) => void;

      /**
       * Creates sample question
       *
       * @returns {typeof createSampleQuestion}
       * @memberof Chainable
       * @example
       *    cy.createSampleQuestion('Provide sample', 'default sample template', '1', '5')
       */
      createSampleQuestion: (
        question: string,
        template: string,
        minEntries?: string,
        maxEntries?: string
      ) => void;


      /**
       * Lets you change the logged in user's active role
       *
       * @returns {typeof changeActiveRole}
       * @memberof Chainable
       * @example
       *    cy.changeActiveRole('User Officer')
       */
      changeActiveRole: (role: string) => void;
    }
  }

  interface Window {
    tinyMCE: any;
  }
}

export {};
