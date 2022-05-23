import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import { Feature, FeatureId } from 'generated/sdk';
import { useFeatures } from 'hooks/admin/useFeatures';

interface FeatureContextData {
  readonly featuresMap: Map<FeatureId, Feature>;
  readonly features: Feature[];
  readonly setFeatures: React.Dispatch<React.SetStateAction<Feature[]>>;
}

const useStyles = makeStyles({
  loader: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const initialFeatureData: FeatureContextData = {
  featuresMap: new Map<FeatureId, Feature>(),
  features: [],
  setFeatures: () => {},
};

export const FeatureContext =
  React.createContext<FeatureContextData>(initialFeatureData);

export const FeatureContextProvider: React.FC = (props) => {
  const { features, loadingFeatures, setFeatures } = useFeatures();
  const classes = useStyles();

  if (loadingFeatures) {
    return (
      <div className={classes.loader} data-cy="loading">
        Loading...
      </div>
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
