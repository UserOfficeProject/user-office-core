import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { StatusAction } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useStatusActionsData(): {
  loadingStatusActions: boolean;
  statusActions: StatusAction[];
  setStatusActions: Dispatch<SetStateAction<StatusAction[]>>;
} {
  const [statusActions, setStatusActions] = useState<StatusAction[]>([]);
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
