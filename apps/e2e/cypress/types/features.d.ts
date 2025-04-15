import {
  UpdateFeaturesInput,
  UpdateFeaturesMutation,
} from '@user-office-software-libs/shared-types';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Update feature flags
       *
       * @returns Cypress.Chainable<UpdateFeaturesMutation>
       * @memberof Chainable
       */
      updateFeature: (
        updateFeaturesInput: UpdateFeaturesInput
      ) => Cypress.Chainable<UpdateFeaturesMutation>;
    }
  }
}

export {};
