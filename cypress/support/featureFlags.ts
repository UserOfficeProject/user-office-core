import { Feature, FeatureId } from '../../src/generated/sdk';

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
