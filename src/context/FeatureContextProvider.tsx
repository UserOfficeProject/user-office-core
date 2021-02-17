import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { Feature, FeatureId } from 'generated/sdk';
import { useFeatures } from 'hooks/admin/useFeatures';

interface FeatureContextData {
  readonly features: Map<FeatureId, Feature>;
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
  features: new Map<FeatureId, Feature>(),
};

export const FeatureContext = React.createContext<FeatureContextData>(
  initialFeatureData
);

export const FeatureContextProvider: React.FC = props => {
  const { features, loadingFeatures } = useFeatures();
  const classes = useStyles();

  if (loadingFeatures) {
    return (
      <div className={classes.loader}>
        <UOLoader size={40} />
      </div>
    );
  }

  const featuresMap = features?.reduce(function(featuresMap, feature) {
    featuresMap.set(feature.id, feature);

    return featuresMap;
  }, new Map<FeatureId, Feature>());

  return (
    <FeatureContext.Provider value={{ features: featuresMap }}>
      {props.children}
    </FeatureContext.Provider>
  );
};
