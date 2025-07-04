import { useEffect, useState } from 'react';

import { BasicUserDetails } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useRemoteUsersData(proposalPk?: number) {
  const [remoteUsers, setRemoteUsers] = useState<BasicUserDetails[]>([]);
  const [loadingRemoteUsers, setLoadingRemoteUsers] = useState(false);

  const api = useDataApi();

  useEffect(() => {
    if (!proposalPk) {
      setRemoteUsers([]);

      return;
    }

    let unmounted = false;

    setLoadingRemoteUsers(true);

    api()
      .getRemoteUsers({ proposalPk })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.remoteUsers) {
          setRemoteUsers(data.remoteUsers);
        } else {
          setRemoteUsers([]);
        }
        setLoadingRemoteUsers(false);
      })
      .catch(() => {
        if (!unmounted) {
          setRemoteUsers([]);
          setLoadingRemoteUsers(false);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api, proposalPk]);

  return { loadingRemoteUsers, remoteUsers, setRemoteUsers };
}
