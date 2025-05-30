import {
  SetCoProposerInvitesInput,
  SetCoProposerInvitesMutation,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates a new invite with the claims
       *
       * @returns {typeof createInvite}
       * @memberof Chainable
       * @example
       *    cy.createInvite({
       *      email: faker.internet.email(),
       *      note: faker.lorem.words(3),
       *      claims: {
       *       roles: [1],
       *       coProposerProposalPk: 1,
       *    }
       *   });
       *    });
       */
      setCoProposerInvites: (
        input: SetCoProposerInvitesInput
      ) => Cypress.Chainable<SetCoProposerInvitesMutation>;
    }
  }
}

export {};
