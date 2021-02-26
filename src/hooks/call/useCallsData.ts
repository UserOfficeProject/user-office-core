import { useEffect, useState, SetStateAction } from 'react';

import { Call, CallsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useCallsData(filter?: CallsFilter) {
  const [callsFilter, setCallsFilter] = useState(filter);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  const api = useDataApi();

  const setCallsWithLoading = (data: SetStateAction<Call[]>) => {
    setLoadingCalls(true);
    setCalls(data);
    setLoadingCalls(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingCalls(true);
    api()
      .getCalls({ filter: callsFilter })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.calls) {
          setCalls(data.calls as Call[]);
        }
        setLoadingCalls(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, callsFilter]);

  return { loadingCalls, calls, setCallsWithLoading, setCallsFilter };
}
