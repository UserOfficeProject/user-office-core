import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { WorkflowStatus } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useWorkflowStatusesData(workflowId: number): {
  loadingStatuses: boolean;
  statuses: WorkflowStatus[];
  setStatusesWithLoading: Dispatch<SetStateAction<WorkflowStatus[]>>;
} {
  const [statuses, setStatuses] = useState<WorkflowStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  const api = useDataApi();

  const setStatusesWithLoading = (data: SetStateAction<WorkflowStatus[]>) => {
    setLoadingStatuses(true);
    setStatuses(data);
    setLoadingStatuses(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingStatuses(true);
    api()
      .getWorkflowStatuses({ workflowId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.workflowStatuses) {
          setStatuses(data.workflowStatuses);
        }
        setLoadingStatuses(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, workflowId]);

  return {
    loadingStatuses,
    statuses,
    setStatusesWithLoading,
  };
}
