import { SetStateAction, useContext, useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';
import { UserContext } from 'context/UserContextProvider';

export function useAccess(action: string, subject: string, fapId: number) {
  const [access, setAccess] = useState<boolean>(false);
  const [loadingAccess, setLoadingAccess] = useState(true);

  const { user, currentRole } = useContext(UserContext);
  const api = useDataApi();

  const setAccessWithLoading = (data: SetStateAction<boolean>) => {
      setLoadingAccess(true);
      setAccess(data);
      setLoadingAccess(false);
    };

  useEffect(() => {
    let unmounted = false;

    setLoadingAccess(true);

    api()
      .getFapAccess({filter: {userId: user.id, role: currentRole!, action, subject, fapId}})
      .then((data) => {
        if (unmounted) {
          return;
        }
          setAccess(data.canAccessFap);
        setLoadingAccess(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, action]);

  return { loadingAccess, access, setAccessWithLoading };
}
