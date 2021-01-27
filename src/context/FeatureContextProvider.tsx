import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { Feature, FeatureId } from 'generated/sdk';
import { useFeatures } from 'hooks/admin/useFeatures';

interface FeatureContextData {
  readonly features: Map<FeatureId, Feature>;
}

const initialFeatureData: FeatureContextData = {
  features: new Map<FeatureId, Feature>(),
};

export const FeatureContext = React.createContext<FeatureContextData>(
  initialFeatureData
);

export const FeatureContextProvider: React.FC = props => {
  const { features, loadingFeatures } = useFeatures();

  if (loadingFeatures) {
    return (
      <UOLoader
        size={40}
        style={{ marginLeft: 'calc(50% - 20px)', marginTop: '40%' }}
      />
    );
  }

  const featuresMap = features.reduce(function(featuresMap, feature) {
    featuresMap.set(feature.id, feature);

    return featuresMap;
  }, new Map<FeatureId, Feature>());

  return (
    <FeatureContext.Provider value={{ features: featuresMap }}>
      {props.children}
    </FeatureContext.Provider>
  );
};
