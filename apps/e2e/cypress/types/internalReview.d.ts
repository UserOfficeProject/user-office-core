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
       *      title: faker.lorem.words(2),
       *      reviewerId: faker.string.alphanumeric(15),
       *      comment: faker.lorem.words(5)
       *      technicalReviewId: faker.string.alphanumeric(15),
       *    });
       */
      createInternalReview: (
        createInternalReviewInput: CreateInternalReviewMutationVariables
      ) => Cypress.Chainable<CreateInternalReviewMutation>;
    }
  }
}

export {};
