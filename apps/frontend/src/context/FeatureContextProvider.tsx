import Box from '@mui/material/Box';
import React from 'react';

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
  const { features, loadingFeatures, setFeatures } = useFeatures();

  if (loadingFeatures) {
    return (
      <Box
        sx={{
          display: 'flex',
          width: '100vw',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        data-cy="loading"
      >
        Loading...
      </Box>
    );
  }

  const featuresMap = features?.reduce(function (featuresMap, feature) {
    featuresMap.set(feature.id, feature);

    return featuresMap;
  }, new Map<FeatureId, Feature>());

  return (
    <FeatureContext.Provider value={{ featuresMap, features, setFeatures }}>
      {props.children}
    </FeatureContext.Provider>
  );
};
