import { useEffect, useState, SetStateAction, useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import {
  Call,
  CallsFilter,
  PaginationSortDirection,
  UserRole,
} from 'generated/sdk';
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
  const { currentRole } = useContext(UserContext);
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

    const getCallsByRole = api().getCallsByRole;
    switch (dataQuantity) {
      case CallsDataQuantity.EXTENDED:
        getCalls = api().getCalls;
        break;
      case CallsDataQuantity.MINIMAL:
        getCalls = api().getCallsMinimal;
        break;
    }
    if (currentRole === UserRole.PROPOSAL_READER) {
      getCallsByRole({}).then((data) => {
        if (unmounted) {
          return;
        }
        if (data.callsByRole) {
          setCalls(data.callsByRole as Call[]);
          setLoadingCalls(false);
        }
      });
    } else {
      getCalls({ filter: callsFilter, ...callsQueryParams }).then((data) => {
        if (unmounted) {
          return;
        }

        if (data.calls) {
          setCalls(data.calls as Call[]);
        }
        setLoadingCalls(false);
      });
    }

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
