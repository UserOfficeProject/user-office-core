import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { PermissionRuleFragment, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function usePermissionRuleData(): {
  loadingPermissionRules: boolean;
  permissionRules: PermissionRuleFragment[];
  setPermissionRulesWithLoading: Dispatch<SetStateAction<PermissionRuleFragment[]>>;
} {
  const [permissionRules, setPermissionRules] = useState<PermissionRuleFragment[]>([]);
  const [loadingPermissionRules, setLoadingPermissionRules] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  const setPermissionRulesWithLoading = (
    data: SetStateAction<PermissionRuleFragment[]>
  ) => {
    setLoadingPermissionRules(true);
    setPermissionRules(data);
    setLoadingPermissionRules(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingPermissionRules(true);
    if (
      currentRole &&
      [UserRole.USER_OFFICER].includes(
        currentRole
      )
    ) {
      api()
        .getPermissionRules()
        .then((data) => {
          if (unmounted) {
            return;
          }
          if (data.permissionRules) {
            setPermissionRules(data.permissionRules.permissionRule);
          }
          setLoadingPermissionRules(false);
        });
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole]);

  return {
    loadingPermissionRules: loadingPermissionRules,
    permissionRules: permissionRules,
    setPermissionRulesWithLoading: setPermissionRulesWithLoading,
  };
}