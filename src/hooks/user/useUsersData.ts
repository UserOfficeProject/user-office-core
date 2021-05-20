import { useEffect, useState } from 'react';

import { GetUsersQuery, GetUsersQueryVariables } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUsersData(filter: GetUsersQueryVariables) {
  const [usersFilter, setUsersFilter] = useState(filter);
  const [usersData, setUsersData] = useState<GetUsersQuery['users'] | null>(
    null
  );
  const [loadingUsersData, setLoading] = useState(true);

  const api = useDataApi();
  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .getUsers(usersFilter)
      .then((data) => {
        if (unmounted) {
          return;
        }

        setUsersData(data.users);
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [usersFilter, api]);

  return { loadingUsersData, usersData, setUsersFilter };
}
