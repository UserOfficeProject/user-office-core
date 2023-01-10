import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useReducer,
} from 'react';

import { ProposalWorkflow } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalWorkflowsData(): {
  loadingProposalWorkflows: boolean;
  proposalWorkflows: ProposalWorkflow[];
  setProposalWorkflowsWithLoading: Dispatch<SetStateAction<ProposalWorkflow[]>>;
  refreshProposalWorkflows: () => void;
} {
  const [update, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const [proposalWorkflows, setProposalWorkflows] = useState<
    ProposalWorkflow[]
  >([]);
  const [loadingProposalWorkflows, setLoadingProposalWorkflows] =
    useState(true);

  const api = useDataApi();

  const refreshProposalWorkflows = () => forceUpdate();

  const setProposalWorkflowsWithLoading = (
    data: SetStateAction<ProposalWorkflow[]>
  ) => {
    setLoadingProposalWorkflows(true);
    setProposalWorkflows(data);
    setLoadingProposalWorkflows(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingProposalWorkflows(true);
    api()
      .getProposalWorkflows()
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.proposalWorkflows) {
          setProposalWorkflows(data.proposalWorkflows as ProposalWorkflow[]);
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
