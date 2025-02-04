import {
  CreateInstrumentMutationVariables,
  CreateInstrumentMutation,
  AssignInstrumentsToCallMutation,
  AssignScientistsToInstrumentMutationVariables,
  AssignScientistsToInstrumentMutation,
  AssignProposalsToInstrumentsMutationVariables,
  AssignProposalsToInstrumentsMutation,
  AssignInstrumentsToCallMutationVariables,
  UpdateTechnicalReviewAssigneeMutation,
  UpdateTechnicalReviewAssigneeMutationVariables,
  CreateInstrumentMutation,
  AddTechnicalReviewMutationVariables,
  AddTechnicalReviewMutation,
  SetInstrumentAvailabilityTimeMutationVariables,
  SetInstrumentAvailabilityTimeMutation,
  SubmitInstrumentInFapMutationVariables,
  SubmitInstrumentInFapMutation,
  RemoveProposalsFromInstrumentMutationVariables,
  RemoveProposalsFromInstrumentMutation,
  UpdateInstrumentMutationVariables,
  UpdateInstrumentMutation,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates a new instrument with the given values
       *
       * @returns {typeof createInstrument}
       * @memberof Chainable
       * @example
       *    cy.createInstrument({
       *      name: faker.random.words(2),
       *      shortCode: faker.random.alphaNumeric(15),
       *      description: faker.random.words(5),
       *      managerUserId: 1
       *    });
       */
      createInstrument: (
        createInstrumentInput: CreateInstrumentMutationVariables
      ) => Cypress.Chainable<CreateInstrumentMutation>;

      /**
       * Assigns available scientist/s to an instrument
       *
       * @returns {typeof assignScientistsToInstrument}
       * @memberof Chainable
       * @example
       *    cy.assignScientistsToInstrument({
       *      scientistIds: [1],
       *      instrumentId: 1
       *    });
       */
      assignScientistsToInstrument: (
        assignScientistsToInstrumentInput: AssignScientistsToInstrumentMutationVariables
      ) => Cypress.Chainable<AssignScientistsToInstrumentMutation>;

      /**
       * Assigns selected proposal/s to instrument/s
       *
       * @returns {typeof assignProposalsToInstruments}
       * @memberof Chainable
       * @example
       *    cy.assignProposalsToInstruments({
       *      proposalPks: [1],
       *      instrumentId: [1]
       *    });
       */
      assignProposalsToInstruments: (
        assignProposalsToInstrumentsInput: AssignProposalsToInstrumentsMutationVariables
      ) => Cypress.Chainable<AssignProposalsToInstrumentsMutation>;

      /**
       * Removes selected proposal/s from all instrument/s
       *
       * @returns {typeof removeProposalsFromInstrument}
       * @memberof Chainable
       * @example
       *    cy.removeProposalsFromInstrument({
       *      proposalPks: [1]
       *    });
       */
      removeProposalsFromInstrument: (
        removeProposalsFromInstrumentInput: RemoveProposalsFromInstrumentMutationVariables
      ) => Cypress.Chainable<RemoveProposalsFromInstrumentMutation>;

      /**
       * Assigns an instrument/s to a selected call
       *
       * @returns {typeof assignInstrumentToCall}
       * @memberof Chainable
       * @example
       *    cy.assignInstrumentToCall({
       *      instrumentIds: 1,
       *      callId: 1
       *    });
       */
      assignInstrumentToCall: (
        assignInstrumentsToCall: AssignInstrumentsToCallMutationVariables
      ) => Cypress.Chainable<AssignInstrumentsToCallMutation>;

      /**
       * Assign technical reviewer assignee to proposal
       *
       * @returns {typeof updateTechnicalReviewAssignee}
       * @memberof Chainable
       * @example
       *    cy.updateTechnicalReviewAssignee({
       *      proposalPks: 1,
       *      userId: 1
       *    });
       */
      updateTechnicalReviewAssignee: (
        updateTechnicalReviewAssigneeInput: UpdateTechnicalReviewAssigneeMutationVariables
      ) => Cypress.Chainable<UpdateTechnicalReviewAssigneeMutation>;

      /**
       * Add technical review to proposal
       *
       * @returns {typeof addProposalTechnicalReview}
       * @memberof Chainable
       * @example
       *    cy.addProposalTechnicalReview();
       */
      addProposalTechnicalReview: (
        addTechnicalReviewInput: AddTechnicalReviewMutationVariables
      ) => Cypress.Chainable<AddTechnicalReviewMutation>;
      /**
       * Set instrument availability time on call
       *
       * @returns {typeof setInstrumentAvailabilityTime}
       * @memberof Chainable
       * @example
       *    cy.setInstrumentAvailabilityTime();
       */
      setInstrumentAvailabilityTime: (
        setInstrumentAvailabilityTimeInput: SetInstrumentAvailabilityTimeMutationVariables
      ) => Cypress.Chainable<SetInstrumentAvailabilityTimeMutation>;

      /**
       * Submit instrument in Fap meeting components
       *
       * @returns {typeof submitInstrumentInFap}
       * @memberof Chainable
       * @example
       *    cy.submitInstrumentInFap(submitInstrumentInFapInput: SubmitInstrumentInFapMutationVariables);
       */
      submitInstrumentInFap: (
        submitInstrumentInFapInput: SubmitInstrumentInFapMutationVariables
      ) => Cypress.Chainable<SubmitInstrumentInFapMutation>;

      /**
       * Update an instrument.
       *
       * @returns {typeof UpdateInstrument}
       * @memberof Chainable
       * @example
       *    cy.updateInstrument(updateInstrumentInput: UpdateInstrumentMutationVariables);
       */
      updateInstrument: (
        updateInstrumentInput: UpdateInstrumentMutationVariables
      ) => Cypress.Chainable<UpdateInstrumentMutation>;
    }
  }
}

export {};
