import { useEffect, useState } from 'react';

import { GetUsersQuery, GetUsersQueryVariables } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUsersData(usersFilter: GetUsersQueryVariables) {
  const { filter, offset, first, subtractUsers, userRole } = usersFilter;
  const [usersData, setUsersData] = useState<GetUsersQuery['users'] | null>(
    null
  );
  const [loadingUsersData, setLoading] = useState(true);

  const api = useDataApi();
  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .getUsers({
        filter,
        offset,
        subtractUsers,
        first,
        userRole,
      })
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
  }, [filter, offset, subtractUsers, first, userRole, api]);

  return { loadingUsersData, usersData, setUsersData };
}
