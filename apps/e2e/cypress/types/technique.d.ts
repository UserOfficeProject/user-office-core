import {
  CreateTechniqueMutationVariables,
  AssignInstrumentsToTechniqueMutationVariables,
  RemoveInstrumentsFromTechniqueMutationVariables,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates a new technique with the given values
       *
       * @returns {typeof createTechnique}
       * @memberof Chainable
       * @example
       *    cy.createTechnique({
       *      name: faker.random.words(2),
       *      shortCode: faker.random.alphaNumeric(15),
       *      description: faker.random.words(5)
       *    });
       */
      createTechnique: (
        createTechniqueInput: CreateTechniqueMutationVariables
      ) => Cypress.Chainable<CreateTechniqueMutation>;

      /**
       * Assigns instrument/s to a technique
       *
       * @returns {typeof assignInstrumentsToTechnique}
       * @memberof Chainable
       * @example
       *    cy.assignInstrumentsToTechnique({
       *      instrumentIds: [1, 2],
       *      techniqueId: 1
       *    });
       */
      assignInstrumentsToTechnique: (
        assignInstrumentsToTechniqueInput: AssignInstrumentsToTechniqueMutationVariables
      ) => Cypress.Chainable<AssignInstrumentsToTechniqueMutation>;

      /**
       * Removes selected proposal/s from all instrument/s
       *
       * @returns {typeof removeProposalsFromInstrument}
       * @memberof Chainable
       * @example
       *    cy.removeInstrumentsFromTechnique({
       *      instrumentIds: [1, 2],
       *      techniqueId: 2,
       *    });
       */
      removeInstrumentsFromTechnique: (
        removeInstrumentsFromTechniqueInput: RemoveInstrumentsFromTechniqueMutationVariables
      ) => Cypress.Chainable<RemoveInstrumentsFromTechniqueMutation>;

      /**
       * Assigns available scientist/s to an technique
       *
       * @returns {typeof assignScientistsToTechnique}
       * @memberof Chainable
       * @example
       *    cy.assignScientistsToTechnique({
       *      scientistIds: [1],
       *      techniqueId: 1
       *    });
       */
      assignScientistsToTechnique: (
        assignScientistsToTechniqueInput: AssignScientistsToTechniqueMutationVariables
      ) => Cypress.Chainable<AssignScientistsToTechniqueMutation>;

      /**
       * Assigns a proposal to techniques
       *
       * @returns {typeof assignProposalToTechniques}
       * @memberof Chainable
       * @example
       *    cy.assignProposalToTechniques({
       *      proposalPk: 1,
       *      techniqueIds: [1,2]
       *    });
       */
      assignProposalToTechniques: (
        assignProposalToTechniquesInput: AssignProposalToTechniquesMutationVariables
      ) => Cypress.Chainable<AssignProposalToTechniquesMutation>;
    }
  }
}

export {};
