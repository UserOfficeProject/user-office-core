declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Defines experiment team
       *
       * @returns {typeof defineExperimentTeam}
       * @memberof Chainable
       * @example
       * cy.defineExperimentTeam({
       *    proposalTitle: proposalTitle,
       *    usersEmails: ['ben@inbox.com'],
       *    teamLead: 'Carlsson',
       * });
       */
      defineExperimentTeam: (params: {
        proposalTitle: string;
        usersEmails: string[];
        teamLead: string;
      }) => void;
    }
  }
}

export {};
