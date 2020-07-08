import { useEffect, useState } from 'react';

import { GetUsersQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/useDataApi';

export function useUsersData(filter: string) {
  const [usersData, setUsersData] = useState<GetUsersQuery['users'] | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const api = useDataApi();
  useEffect(() => {
    setLoading(true);
    api()
      .getUsers({ filter })
      .then(data => {
        setUsersData(data.users);
        setLoading(false);
      });
  }, [filter, api]);

  return { loading, usersData };
}
