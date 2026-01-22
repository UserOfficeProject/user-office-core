import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { PermissionFragment, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function usePermissionsData(callIds?: number[]): {
  loadingPermissions: boolean;
  permissions: PermissionFragment[];
  setPermissionsWithLoading: Dispatch<SetStateAction<PermissionFragment[]>>;
} {
  const [permissions, setPermissions] = useState<PermissionFragment[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  const setPermissionsWithLoading = (
    data: SetStateAction<PermissionFragment[]>
  ) => {
    setLoadingPermissions(true);
    setPermissions(data);
    setLoadingPermissions(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingPermissions(true);
    if (
      currentRole &&
      [UserRole.USER_OFFICER, UserRole.INSTRUMENT_SCIENTIST].includes(
        currentRole
      )
    ) {
      api()
        .getPermissions()
        .then((data) => {
          if (unmounted) {
            return;
          }
          if (data.permissions) {
            setPermissions(data.permissions.permissions);
          }
          setLoadingPermissions(false);
        });
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole, callIds]);

  return {
    loadingPermissions,
    permissions,
    setPermissionsWithLoading,
  };
}
