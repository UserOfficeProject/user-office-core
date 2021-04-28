declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates new proposal with title and abstract passed. If nothing is passed it generates title and abstract on its own. You need to be logged in as a user.
       *
       * @returns {typeof createProposal}
       * @memberof Chainable
       * @example
       *    cy.createProposal('Proposal title', 'Proposal abstract')
       */
      createProposal: (
        proposalTitle?: string,
        proposalAbstract?: string,
        call?: string,
        proposer?: string
      ) => void;
    }
  }
}

export {};
