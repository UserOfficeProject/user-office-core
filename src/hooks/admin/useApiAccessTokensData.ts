import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { PermissionsWithAccessToken } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useApiAccessTokensData(): {
  loadingApiAccessTokens: boolean;
  apiAccessTokens: PermissionsWithAccessToken[];
  setApiAccessTokensWithLoading: Dispatch<
    SetStateAction<PermissionsWithAccessToken[]>
  >;
} {
  const [apiAccessTokens, setApiAccessTokens] = useState<
    PermissionsWithAccessToken[]
  >([]);
  const [loadingApiAccessTokens, setLoadingApiAccessTokens] = useState(true);

  const api = useDataApi();

  const setApiAccessTokensWithLoading = (
    data: SetStateAction<PermissionsWithAccessToken[]>
  ) => {
    setLoadingApiAccessTokens(true);
    setApiAccessTokens(data);
    setLoadingApiAccessTokens(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingApiAccessTokens(true);
    api()
      .getAllApiAccessTokensAndPermissions()
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.allAccessTokensAndPermissions) {
          setApiAccessTokens(
            data.allAccessTokensAndPermissions as PermissionsWithAccessToken[]
          );
        }
        setLoadingApiAccessTokens(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api]);

  return {
    loadingApiAccessTokens,
    apiAccessTokens,
    setApiAccessTokensWithLoading,
  };
}
