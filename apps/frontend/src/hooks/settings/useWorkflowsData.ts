import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useReducer,
} from 'react';

import { Workflow, WorkflowType } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useWorkflowsData(entityType: WorkflowType): {
  //TODO: Entity Type should be extraced from the sdk
  loadingWorkflows: boolean;
  workflows: Workflow[];
  setWorkflowsWithLoading: Dispatch<SetStateAction<Workflow[]>>;
  refreshWorkflows: () => void;
} {
  const [update, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(true);

  const api = useDataApi();

  const refreshWorkflows = () => forceUpdate();

  const setWorkflowsWithLoading = (data: SetStateAction<Workflow[]>) => {
    setLoadingWorkflows(true);
    setWorkflows(data);
    setLoadingWorkflows(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingWorkflows(true);
    api()
      .getWorkflows({ entityType: entityType })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.workflows) {
          setWorkflows(data.workflows as Workflow[]);
        }
        setLoadingWorkflows(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, update]);

  return {
    loadingWorkflows,
    workflows,
    setWorkflowsWithLoading,
    refreshWorkflows,
  };
}
