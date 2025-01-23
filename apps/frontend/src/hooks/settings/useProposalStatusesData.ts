import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { Status } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalStatusesData(): {
  loadingProposalStatuses: boolean;
  proposalStatuses: Status[];
  setProposalStatusesWithLoading: Dispatch<SetStateAction<Status[]>>;
} {
  const [proposalStatuses, setProposalStatuses] = useState<Status[]>([]);
  const [loadingProposalStatuses, setLoadingProposalStatuses] = useState(true);

  const api = useDataApi();

  const setProposalStatusesWithLoading = (data: SetStateAction<Status[]>) => {
    setLoadingProposalStatuses(true);
    setProposalStatuses(data);
    setLoadingProposalStatuses(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingProposalStatuses(true);
    api()
      .getStatuses({ entityType: 'proposal' })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.statuses) {
          setProposalStatuses(data.statuses as Status[]);
        }
        setLoadingProposalStatuses(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return {
    loadingProposalStatuses,
    proposalStatuses,
    setProposalStatusesWithLoading,
  };
}
