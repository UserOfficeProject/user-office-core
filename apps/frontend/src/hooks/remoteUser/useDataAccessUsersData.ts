import { useEffect, useState } from 'react';

import { BasicUserDetails } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useDataAccessUsersData(proposalPk?: number) {
  const [dataAccessUsers, setDataAccessUsers] = useState<BasicUserDetails[]>(
    []
  );
  const [loadingDataAccessUsers, setLoadingDataAccessUsers] = useState(false);

  const api = useDataApi();

  useEffect(() => {
    if (!proposalPk) {
      setDataAccessUsers([]);

      return;
    }

    let unmounted = false;

    setLoadingDataAccessUsers(true);

    api()
      .getDataAccessUsers({ proposalPk })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.dataAccessUsers) {
          setDataAccessUsers(data.dataAccessUsers);
        } else {
          setDataAccessUsers([]);
        }
        setLoadingDataAccessUsers(false);
      })
      .catch(() => {
        if (!unmounted) {
          setDataAccessUsers([]);
          setLoadingDataAccessUsers(false);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api, proposalPk]);

  return { loadingDataAccessUsers, dataAccessUsers, setDataAccessUsers };
}
