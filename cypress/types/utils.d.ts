declare global {
  namespace Cypress {
    interface Chainable {
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
        text: string | RegExp;
      }) => void;

      /**
       * Closes notification.
       *
       * @returns {typeof notification}
       * @memberof Chainable
       * @example
       *    cy.closeNotification()
       */
      closeNotification: () => void;

      /**
       * Closes modal.
       *
       * @returns {typeof closeModal}
       * @memberof Chainable
       * @example
       *    cy.closeModal()
       */
      closeModal: () => void;

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
       * Call this method before your test to have delay between clicks
       * Excellent for presentation purposes
       *
       * @returns {typeof presentationMode}
       * @memberof Chainable
       * @example
       *    cy.presentationMode()
       */
      presentationMode: () => void;

      /**
       * Set content in TinyMCE fetched by editor id.
       *
       * @returns {typeof setTinyMceContent}
       * @memberof Chainable
       * @example
       *    cy.setTinyMceContent('editorId', 'content to type inside the editor')
       */
      setTinyMceContent: (tinyMceId: string, content: string) => void;

      /**
       * Get content from TinyMCE editor fetched by editor id.
       *
       * @returns {typeof getTinyMceContent}
       * @memberof Chainable
       * @example
       *    cy.getTinyMceContent('editorId')
       */
      getTinyMceContent: (tinyMceId: string) => Promise<string>;
    }
  }

  interface Window {
    tinyMCE: any;
  }
}

export {};
