import React, { useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { Feature, FeatureId } from 'generated/sdk';
import { useFeatures } from 'hooks/admin/useFeatures';

interface FeatureContextData {
  readonly featuresMap: Map<FeatureId, Feature>;
  readonly features: Feature[];
  readonly setFeatures: React.Dispatch<React.SetStateAction<Feature[]>>;
}

const initialFeatureData: FeatureContextData = {
  featuresMap: new Map<FeatureId, Feature>(),
  features: [],
  setFeatures: () => {},
};

export const FeatureContext =
  React.createContext<FeatureContextData>(initialFeatureData);

export const FeatureContextProvider = (props: {
  children: React.ReactNode;
}) => {
  const { features, setFeatures, loadingFeatures } = useFeatures();
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!loadingFeatures) {
      setHasLoaded(true);
    }
  }, [loadingFeatures]);

  if (loadingFeatures && !hasLoaded) {
    return <UOLoader />;
  }

  const featuresMap = features?.reduce(function (featuresMap, feature) {
    featuresMap.set(feature.id, feature);

    return featuresMap;
  }, new Map<FeatureId, Feature>());

  return (
    <FeatureContext value={{ featuresMap, features, setFeatures }}>
      {props.children}
    </FeatureContext>
  );
};
