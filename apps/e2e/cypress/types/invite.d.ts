import { CreateInviteMutation } from '../../../frontend/src/generated/sdk';

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
      createInvite: ({
        input: CreateInviteInput,
      }) => Cypress.Chainable<CreateInviteMutation>;
    }
  }
}

export {};
