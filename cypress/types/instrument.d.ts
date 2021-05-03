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
       *    })
       */
      createInstrument: (instrument: {
        name: string;
        shortCode: string;
        description: string;
      }) => void;

      /**
       * Assigns all available scientist to an instrument
       *
       * @returns {typeof assignScientistsToInstrument}
       * @memberof Chainable
       * @example
       *    cy.assignScientistsToInstrument('instrument name / code');
       */
      assignScientistsToInstrument: (instrument) => void;

      /**
       * Assigns an instrument to a selected proposal
       *
       * @returns {typeof assignInstrumentToProposal}
       * @memberof Chainable
       * @example
       *    cy.assignInstrumentToProposal('proposal name or code', 'instrument name')
       */
      assignInstrumentToProposal: (
        proposal: string,
        instrument: string
      ) => void;

      /**
       * Assigns an instrument to a selected call
       *
       * @returns {typeof assignInstrumentToCall}
       * @memberof Chainable
       * @example
       *    cy.assignInstrumentToCall('call name or code', 'instrument code or short code')
       */
      assignInstrumentToCall: (call: string, instrument: string) => void;
    }
  }
}

export {};
