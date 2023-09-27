import { useEffect, useState } from 'react';

import {
  BasicUserDetailsFragment,
  GetUsersQueryVariables,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUsersData(
  usersFilter: GetUsersQueryVariables & { refreshData?: boolean }
) {
  const {
    filter,
    offset,
    first,
    subtractUsers,
    userRole,
    refreshData,
    orderBy,
    orderDirection,
  } = usersFilter;
  const [usersData, setUsersData] = useState<{
    totalCount: number;
    users: Array<BasicUserDetailsFragment>;
  }>({
    totalCount: 0,
    users: [],
  });
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
        orderBy,
        orderDirection,
      })
      .then((data) => {
        if (unmounted) {
          return;
        }

        setUsersData(data.users || { totalCount: 0, users: [] });
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [
    filter,
    offset,
    subtractUsers,
    first,
    orderBy,
    orderDirection,
    userRole,
    api,
    refreshData,
  ]);

  return { loadingUsersData, usersData, setUsersData };
}
