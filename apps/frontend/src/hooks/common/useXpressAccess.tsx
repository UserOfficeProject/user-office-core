import { useContext } from 'react';

import { FeatureContext } from 'context/FeatureContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { FeatureId, UserRole } from 'generated/sdk';

export const useXpressAccess = (allowedRoles: UserRole[]) => {
  // Check if user have access
  let isUserAllowed = false;
  const { currentRole } = useContext(UserContext);
  if (currentRole && allowedRoles.includes(currentRole)) {
    isUserAllowed = true;
  }

  //Check if feature flag is enabled
  const featureContext = useContext(FeatureContext);
  const isXpressRouteEnabled = featureContext.featuresMap.get(
    FeatureId.STFC_XPRESS_MANAGEMENT
  )?.isEnabled;

  return isUserAllowed && isXpressRouteEnabled;
};
