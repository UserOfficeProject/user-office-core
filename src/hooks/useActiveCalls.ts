import { useEffect, useState } from 'react';

import { GetCallsQuery, GetCallsQueryVariables } from './../generated/sdk';
import { useDataApi } from './useDataApi';

export function useActiveCalls(filter: GetCallsQueryVariables) {
  const [calls, setCalls] = useState<GetCallsQuery['calls']>();

  const api = useDataApi();

  useEffect(() => {
    api()
      .getCalls(filter)
      .then(data => {
        setCalls(data.calls);
      });
  }, [api, filter]);

  return calls;
}
