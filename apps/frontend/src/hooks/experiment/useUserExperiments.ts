import { useEffect, useState } from 'react';

import {
  GetUserExperimentsQuery,
  GetUserExperimentsQueryVariables,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

type MeType = NonNullable<GetUserExperimentsQuery['me']>;
export type UserExperiment = MeType['experiments'][number];

export function useUserExperiments(args?: GetUserExperimentsQueryVariables) {
  const [userExperiments, setUserUpcomingExperiments] = useState<
    UserExperiment[]
  >([]);

  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoading(true);

    api()
      .getUserExperiments(args)
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.me?.experiments) {
          setUserUpcomingExperiments(data.me?.experiments);
          setLoading(false);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api, args]);

  return { userExperiments, setUserUpcomingExperiments, loading };
}
