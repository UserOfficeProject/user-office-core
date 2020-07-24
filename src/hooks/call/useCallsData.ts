import { useEffect, useState } from 'react';

import { Call, GetCallsQuery, CallsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useCallsData(filter?: CallsFilter) {
  const [callsFilter, setCallsFilter] = useState(filter);
  const [callsData, setCallsData] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getCalls({ filter })
      .then(data => {
        if (data.calls) {
          setCallsData(data.calls);
        }
        setLoading(false);
      });
  }, [api, callsFilter]);

  return { loading, callsData, setCallsData, setCallsFilter };
}
