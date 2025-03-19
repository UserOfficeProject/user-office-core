import {
  CreateFacilityMutation,
  CreateFacilityMutationVariables,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Create a facility
       *
       * @returns {typeof CreateFacilityMutation}
       * @memberof Chainable
       * @example
       *    cy.ceateFacility({ name: 'name', shortCode: 'shortCode' })
       */
      createFacility: (
        updateFacilityInput?: CreateFacilityMutationVariables
      ) => Cypress.Chainable<CreateFacilityMutation>;
    }
  }
}

export {};
