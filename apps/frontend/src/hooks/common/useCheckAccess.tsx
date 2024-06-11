import { useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { UserRole } from 'generated/sdk';

export const useCheckAccess = (allowedRoles: UserRole[]) => {
  const { currentRole } = useContext(UserContext);

  if (!currentRole) {
    return false;
  }

  if (allowedRoles.includes(currentRole)) {
    return true;
  }

  return false;
};
