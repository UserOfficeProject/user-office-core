import {
  CreateVisitMutationVariables,
  CreateVisitRegistrationMutation,
  SubmitVisitRegistrationMutation,
  SubmitVisitRegistrationMutationVariables,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Defines experiment team
       *
       * @returns {typeof createVisit}
       * @memberof Chainable
       * @example
       * cy.createVisit({
       *    proposalTitle: proposalTitle,
       *    usersEmails: ['ben@inbox.com'],
       *    teamLead: 'Carlsson',
       * });
       */
      createVisit: (
        createVisitInput: CreateVisitMutationVariables
      ) => Cypress.Chainable<CreateVisitMutation>;
      /**
       * Create visit registration
       *
       * @returns {typeof createVisitRegistration}
       * @memberof Chainable
       * @example
       * cy.createVisitRegistration({
       *    visitId: visitId,
       *    userId: userId,
       * });
       */
      createVisitRegistration: (
        input: CreateVisitRegistrationMutationVariables
      ) => Cypress.Chainable<CreateVisitRegistrationMutation>;

      /**
       * Submit visit registration
       *
       * @returns {typeof submitVisitRegistration}
       * @memberof Chainable
       * @example
       * cy.submitVisitRegistration({
       *    visitId: visitId,
       *    userId: userId,
       * });
       */
      submitVisitRegistration: (
        input: SubmitVisitRegistrationMutationVariables
      ) => Cypress.Chainable<SubmitVisitRegistrationMutation>;
    }
  }
}

export {};
