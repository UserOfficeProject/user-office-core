import { useEffect, useState, SetStateAction } from 'react';

import { Call, CallsFilter, PaginationSortDirection } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export enum CallsDataQuantity {
  EXTENDED,
  MINIMAL,
}

type QueryParameters = {
  sortField?: string | undefined;
  sortDirection?: PaginationSortDirection | undefined;
};

export function useCallsData(
  filter?: CallsFilter,
  queryParameters?: QueryParameters,
  dataQuantity: CallsDataQuantity = CallsDataQuantity.MINIMAL,
  skip: boolean = false
) {
  const [callsFilter, setCallsFilter] = useState(filter);
  const [callsQueryParams, setCallsQueryParams] = useState(queryParameters);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  const api = useDataApi();

  const setCallsWithLoading = (data: SetStateAction<Call[]>) => {
    setLoadingCalls(true);
    setCalls(data);
    setLoadingCalls(false);
  };

  useEffect(() => {
    if (skip) {
      setLoadingCalls(false);

      return;
    }
    let unmounted = false;

    setLoadingCalls(true);

    let getCalls;
    switch (dataQuantity) {
      case CallsDataQuantity.EXTENDED:
        getCalls = api().getCalls;
        break;
      case CallsDataQuantity.MINIMAL:
        getCalls = api().getCallsMinimal;
        break;
    }

    getCalls({ filter: callsFilter, ...callsQueryParams }).then((data) => {
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
  }, [api, callsFilter, dataQuantity, callsQueryParams, skip]);

  return {
    loadingCalls,
    calls,
    setCallsWithLoading,
    setCallsFilter,
    setCallsQueryParams,
  };
}
