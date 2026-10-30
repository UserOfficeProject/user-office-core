import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { OAuthClient } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useOAuthClientsData(): {
  loadingOAuthClients: boolean;
  oauthClients: OAuthClient[];
  setOAuthClientsWithLoading: Dispatch<SetStateAction<OAuthClient[]>>;
} {
  const [oauthClients, setOAuthClients] = useState<OAuthClient[]>([]);
  const [loadingOAuthClients, setLoadingOAuthClients] = useState(true);

  const api = useDataApi();

  const setOAuthClientsWithLoading = (data: SetStateAction<OAuthClient[]>) => {
    setLoadingOAuthClients(true);
    setOAuthClients(data);
    setLoadingOAuthClients(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingOAuthClients(true);
    api()
      .getAllOAuthClients()
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.allOAuthClients) {
          setOAuthClients(data.allOAuthClients as OAuthClient[]);
        }
        setLoadingOAuthClients(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api]);

  return {
    loadingOAuthClients,
    oauthClients,
    setOAuthClientsWithLoading,
  };
}
