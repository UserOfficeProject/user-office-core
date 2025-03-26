import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

import { ExperimentStatus, GetUserExperimentsQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

type MeType = NonNullable<GetUserExperimentsQuery['me']>;
export type UserExperiment = MeType['experiments'][number];

export function useUserExperiments() {
  const [userExperiments, setUserUpcomingExperiments] = useState<
    UserExperiment[]
  >([]);

  const [loading, setLoading] = useState(true);

  const api = useDataApi();
  useEffect(() => {
    let unmounted = false;

    setLoading(true);

    api()
      .getUserExperiments({
        filter: {
          status: [ExperimentStatus.ACTIVE, ExperimentStatus.COMPLETED],
          endsAfter: DateTime.now().toUTC().toISO(),
        },
      })
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
  }, [api]);

  return { userExperiments, setUserUpcomingExperiments, loading };
}
