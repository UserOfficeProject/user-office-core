import {
  CreateCallInput,
  CreateCallMutation,
  UpdateCallMutation,
  UpdateCallMutationVariables,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates new call with values passed. If nothing is passed it generates random values. You need to be logged in as a user-officer.
       *
       * @returns {typeof createCall}
       * @memberof Chainable
       * @example
       *    cy.createCall({shortCode: 'Test call 1', startDate: '22-02-2021', endDate: '28-02-2021', surveyComment: 'This is survey comment', cycleComment: 'This is cycle comment'})
       */
      createCall: (
        newCallInput: CreateCallInput
      ) => Cypress.Chainable<CreateCallMutation>;

      /**
       * Updates call with values passed.
       *
       * @returns {typeof updateCall}
       * @memberof Chainable
       * @example
       *    cy.updateCall({shortCode: 'Test call 1', startDate: '22-02-2021', endDate: '28-02-2021', surveyComment: 'This is survey comment', cycleComment: 'This is cycle comment'})
       */
      updateCall: (
        updateCallInput: UpdateCallMutationVariables
      ) => Cypress.Chainable<UpdateCallMutation>;
    }
  }
}

export {};
