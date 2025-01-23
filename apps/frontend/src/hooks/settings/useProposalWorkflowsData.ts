import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useReducer,
} from 'react';

import { Workflow } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalWorkflowsData(): {
  loadingProposalWorkflows: boolean;
  proposalWorkflows: Workflow[];
  setProposalWorkflowsWithLoading: Dispatch<SetStateAction<Workflow[]>>;
  refreshProposalWorkflows: () => void;
} {
  const [update, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const [proposalWorkflows, setProposalWorkflows] = useState<Workflow[]>([]);
  const [loadingProposalWorkflows, setLoadingProposalWorkflows] =
    useState(true);

  const api = useDataApi();

  const refreshProposalWorkflows = () => forceUpdate();

  const setProposalWorkflowsWithLoading = (
    data: SetStateAction<Workflow[]>
  ) => {
    setLoadingProposalWorkflows(true);
    setProposalWorkflows(data);
    setLoadingProposalWorkflows(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingProposalWorkflows(true);
    api()
      .getWorkflows({ entityType: 'proposal' })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.workflows) {
          setProposalWorkflows(data.workflows as Workflow[]);
        }
        setLoadingProposalWorkflows(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, update]);

  return {
    loadingProposalWorkflows,
    proposalWorkflows,
    setProposalWorkflowsWithLoading,
    refreshProposalWorkflows,
  };
}
