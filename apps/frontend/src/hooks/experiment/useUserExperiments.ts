import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

import { ExperimentStatus, GetUserExperimentsQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

type MeType = NonNullable<GetUserExperimentsQuery['me']>;
export type UserExperiment = MeType['experiments'][number];

export function useUserExperiments({
  onlyUpcoming,
  notDraft,
  instrumentId,
}: {
  onlyUpcoming?: boolean;
  notDraft?: boolean;
  instrumentId?: number | null;
}) {
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
          status: notDraft
            ? [ExperimentStatus.ACTIVE, ExperimentStatus.COMPLETED]
            : null,
          endsAfter: onlyUpcoming ? DateTime.now().toUTC().toISO() : null,
          instrumentId,
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
