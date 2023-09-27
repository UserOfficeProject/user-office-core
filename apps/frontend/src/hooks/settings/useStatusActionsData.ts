import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { ProposalStatusAction } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useStatusActionsData(): {
  loadingStatusActions: boolean;
  statusActions: ProposalStatusAction[];
  setStatusActions: Dispatch<SetStateAction<ProposalStatusAction[]>>;
} {
  const [statusActions, setStatusActions] = useState<ProposalStatusAction[]>(
    []
  );
  const [loadingStatusActions, setLoadingStatusActions] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingStatusActions(true);
    api()
      .getStatusActions()
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.statusActions) {
          setStatusActions(data.statusActions);
        }
        setLoadingStatusActions(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return {
    loadingStatusActions,
    statusActions,
    setStatusActions,
  };
}
