import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { AccessRuleFragment, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useAccessRuleData(): {
  loadingAccessRules: boolean;
  accessRules: AccessRuleFragment[];
  setAccessRulesWithLoading: Dispatch<SetStateAction<AccessRuleFragment[]>>;
} {
  const [accessRules, setAccessRules] = useState<AccessRuleFragment[]>([]);
  const [loadingAccessRules, setLoadingAccessRules] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  const setAccessRulesWithLoading = (
    data: SetStateAction<AccessRuleFragment[]>
  ) => {
    setLoadingAccessRules(true);
    setAccessRules(data);
    setLoadingAccessRules(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingAccessRules(true);
    if (
      currentRole &&
      [UserRole.USER_OFFICER, UserRole.INSTRUMENT_SCIENTIST].includes(
        currentRole
      )
    ) {
      api()
        .getAccessRules()
        .then((data) => {
          if (unmounted) {
            return;
          }
          if (data.accessRules) {
            setAccessRules(data.accessRules.accessRule);
          }
          setLoadingAccessRules(false);
        });
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole]);

  return {
    loadingAccessRules,
    accessRules,
    setAccessRulesWithLoading,
  };
}