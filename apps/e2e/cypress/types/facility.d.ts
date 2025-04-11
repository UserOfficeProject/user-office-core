import {
  CreateFacilityMutation,
  CreateFacilityMutationVariables,
  AssignUsersToFacilityMutationVariables,
  AssignUsersToFacilityMutation,
  AssignInstrumentsToFacilityMutationVariables,
  AssignInstrumentsToFacilityMutation,
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
        updateFacilityInput: CreateFacilityMutationVariables
      ) => Cypress.Chainable<CreateFacilityMutation>;

      /**
       * Add User to a facility
       *
       * @returns {typeof AssignUsersToFacilityMutation}
       * @memberof Chainable
       * @example
       *    cy.addUserToFacility({ userIds: [1], facilityId: [1] })
       */
      addUserToFacility: (
        updateFacilityInput: AssignUsersToFacilityMutationVariables
      ) => Cypress.Chainable<AssignUsersToFacilityMutation>;

      /**
       * Add Instrument  to a facility
       *
       * @returns {typeof AssignUsersToFacilityMutation}
       * @memberof Chainable
       * @example
       *    cy.addUserToFacility({ instrumentIds: [1], facilityId: [1] })
       */
      addInstrumentToFacility: (
        updateFacilityInput: AssignInstrumentsToFacilityMutationVariables
      ) => Cypress.Chainable<AssignInstrumentsToFacilityMutation>;
    }
  }
}

export {};
