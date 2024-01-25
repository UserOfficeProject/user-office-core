import { useEffect, useState } from 'react';

import { BasicUserDetailsFragment, InstrumentFragment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUsersDataByFilter(instrument: InstrumentFragment | null) {
  const api = useDataApi();

  const [usersData, setUsersData] = useState<{
    totalCount: number;
    users: Array<BasicUserDetailsFragment>;
  }>({
    totalCount: 0,
    users: [],
  });

  useEffect(() => {
    if (instrument) {
      api()
        .getUser({ userId: instrument.managerUserId })
        .then((data) => {
          api()
            .getUsers({ filter: data.user?.lastname })
            .then((data) => {
              setUsersData(data.users || { totalCount: 0, users: [] });
            });
        });
    }
  }, [api, instrument]);

  return { usersData, setUsersData };
}
