import { useEffect, useState } from 'react';

import { GetCallsQuery, GetCallsQueryVariables } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useCallsData(show: boolean, filter: GetCallsQueryVariables) {
  const [callsData, setCallsData] = useState<GetCallsQuery['calls'] | null>();
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  /**
   * NOTE: Fix api calls loop!
   * When we put filter as an object in the dependency array it is never equal to previous object.
   * This is how object equality works.
   * Comparing objects is all about the place in the computer memory where they are stored, not about the value they represent.
   */
  const templateIds = filter.filter?.templateIds;
  const isActive = filter.filter?.isActive;

  useEffect(() => {
    api()
      .getCalls({
        filter: {
          templateIds,
          isActive,
        },
      })
      .then(data => {
        setCallsData(data.calls);
        setLoading(false);
      });
  }, [api, show, templateIds, isActive]);

  return { loading, callsData };
}
