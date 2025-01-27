import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { Status } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useStatusesData(entityType: 'proposal' | 'experiment'): {
  loadingStatuses: boolean;
  statuses: Status[];
  setStatusesWithLoading: Dispatch<SetStateAction<Status[]>>;
} {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  const api = useDataApi();

  const setStatusesWithLoading = (data: SetStateAction<Status[]>) => {
    setLoadingStatuses(true);
    setStatuses(data);
    setLoadingStatuses(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingStatuses(true);
    api()
      .getStatuses({ entityType })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.statuses) {
          setStatuses(data.statuses as Status[]);
        }
        setLoadingStatuses(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return {
    loadingStatuses,
    statuses,
    setStatusesWithLoading,
  };
}
