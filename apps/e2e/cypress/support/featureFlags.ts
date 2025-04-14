import {
  FeatureId,
  Feature,
  UpdateFeaturesInput,
  UpdateFeaturesMutation,
} from '@user-office-software-libs/shared-types';

import { getE2EApi } from './utils';

export default {
  getEnabledFeatures: () => {
    const features = window.localStorage.getItem('enabledFeatures');

    let featuresMap = new Map<FeatureId, boolean>();

    if (features) {
      featuresMap = new Map(
        JSON.parse(features).map((feature: Feature) => [
          feature.id,
          feature.isEnabled,
        ])
      );
    }

    return featuresMap;
  },
};

const updateFeature = (
  updateFeaturesInput: UpdateFeaturesInput
): Cypress.Chainable<UpdateFeaturesMutation> => {
  const api = getE2EApi();
  const request = api.updateFeatures({ input: updateFeaturesInput });

  return cy.wrap(request);
};

Cypress.Commands.add('updateFeature', updateFeature);
