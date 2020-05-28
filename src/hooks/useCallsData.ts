import { useEffect, useState } from 'react';

import { GetCallsQuery, GetCallsQueryVariables } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useCallsData(filter?: GetCallsQueryVariables) {
  const [callsData, setCallsData] = useState<GetCallsQuery['calls'] | null>();
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getCalls(filter)
      .then(data => {
        setCallsData(data.calls);
        setLoading(false);
      });
  }, [api, filter]);

  return { loading, callsData, filter };
}
