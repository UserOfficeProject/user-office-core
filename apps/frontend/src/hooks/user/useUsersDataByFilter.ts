import { useEffect, useState } from 'react';

import { BasicUserDetailsFragment, InstrumentFragment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUsersDataByFilter(instrument: InstrumentFragment | null) {
  const api = useDataApi();
  const [surName, setSurName] = useState<string>();
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
          setSurName(data.user?.lastname);
          api()
            .getUsers({ filter: surName })
            .then((data) => {
              setUsersData(data.users || { totalCount: 0, users: [] });
            });
        });
    }
  }, [api, surName, instrument]);

  return { usersData, setUsersData };
}
