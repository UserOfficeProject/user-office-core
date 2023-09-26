import {
  CreateInternalReviewMutation,
  CreateInternalReviewMutationVariables,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

const createInternalReview = (
  createInternalReviewInput: CreateInternalReviewMutationVariables
): Cypress.Chainable<CreateInternalReviewMutation> => {
  const api = getE2EApi();
  const request = api.createInternalReview(createInternalReviewInput);

  return cy.wrap(request);
};

Cypress.Commands.add('createInternalReview', createInternalReview);
