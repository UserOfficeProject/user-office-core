import { useEffect, useState } from 'react';

import { GetUserExperimentsQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

type MeType = NonNullable<GetUserExperimentsQuery['me']>;
export type UpcomingExperimentsType = MeType['upcomingExperiments'][number];

export function useUserUpcomingExperiments() {
  const [userUpcomingExperiments, setUserUpcomingExperiments] = useState<
    UpcomingExperimentsType[]
  >([]);

  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoading(true);

    api()
      .getUserExperiments()
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.me?.upcomingExperiments) {
          setUserUpcomingExperiments(data.me?.upcomingExperiments);
          setLoading(false);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return { userUpcomingExperiments, loading };
}
