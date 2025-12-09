import { SetStateAction, useContext, useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';
import { UserContext } from 'context/UserContextProvider';

export function useAccess(action: string, subject: string) {
  const [access, setAccess] = useState<boolean>(false);
  const [loadingAccess, setLoadingAccess] = useState(true);

  const { user } = useContext(UserContext);
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
      .getAccess({filter: {userId: user.id, action: action, subject: subject}})
      .then((data) => {
        if (unmounted) {
          return;
        }
          setAccess(data.canAccess);
        setLoadingAccess(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, action]);

  return { loadingAccess, access, setAccessWithLoading };
}
