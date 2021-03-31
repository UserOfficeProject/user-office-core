import { useEffect, useState } from 'react';

import { GetUsersQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUsersData(filter: string) {
  const [usersData, setUsersData] = useState<GetUsersQuery['users'] | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const api = useDataApi();
  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .getUsers({ filter })
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
  }, [filter, api]);

  return { loading, usersData };
}
