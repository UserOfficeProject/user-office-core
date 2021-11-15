import {
  CreateInstrumentMutationVariables,
  AssignScientistsToInstrumentMutationVariables,
  AssignProposalsToInstrumentMutationVariables,
  AssignInstrumentsToCallMutationVariables,
  UpdateTechnicalReviewAssigneeMutationVariables,
} from '../../src/generated/sdk';

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
      ) => void;

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
      ) => void;

      /**
       * Assigns selected proposal/s to an instrument
       *
       * @returns {typeof assignProposalsToInstrument}
       * @memberof Chainable
       * @example
       *    cy.assignProposalsToInstrument({
       *      proposals: {
       *        callId: 1,
       *        primaryKey: 1
       *      },
       *      instrumentId: 1
       *    });
       */
      assignProposalsToInstrument: (
        assignProposalsToInstrumentInput: AssignProposalsToInstrumentMutationVariables
      ) => void;

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
      ) => void;

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
      ) => void;
    }
  }
}

export {};
