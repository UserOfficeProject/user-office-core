import { useEffect, useState } from 'react';

import { Call, CallsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useCallsData(filter?: CallsFilter) {
  const [callsFilter, setCallsFilter] = useState(filter);
  const [callsData, setCallsData] = useState<Call[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getCalls({ filter: callsFilter })
      .then(data => {
        if (data.calls) {
          setCallsData(data.calls);
        }
        setLoadingCalls(false);
      });
  }, [api, callsFilter]);

  return { loadingCalls, callsData, setCallsData, setCallsFilter };
}
