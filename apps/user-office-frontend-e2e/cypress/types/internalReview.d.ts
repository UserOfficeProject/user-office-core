import {
  CreateInternalReviewMutation,
  CreateInternalReviewMutationVariables,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates a new internal review with the given values
       *
       * @returns {typeof createInternalReview}
       * @memberof Chainable
       * @example
       *    cy.createInternalReview({
       *      title: faker.random.words(2),
       *      reviewerId: faker.random.alphaNumeric(15),
       *      comment: faker.random.words(5)
       *      technicalReviewId: faker.random.alphaNumeric(15),
       *    });
       */
      createInternalReview: (
        createInternalReviewInput: CreateInternalReviewMutationVariables
      ) => Cypress.Chainable<CreateInternalReviewMutation>;
    }
  }
}

export {};
