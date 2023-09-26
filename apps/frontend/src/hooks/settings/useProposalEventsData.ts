import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { ProposalEvent } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalEventsData(): {
  loadingProposalEvents: boolean;
  proposalEvents: ProposalEvent[];
  setProposalEventsWithLoading: Dispatch<SetStateAction<ProposalEvent[]>>;
} {
  const [proposalEvents, setProposalEvents] = useState<ProposalEvent[]>([]);
  const [loadingProposalEvents, setLoadingProposalEvents] = useState(true);

  const api = useDataApi();

  const setProposalEventsWithLoading = (
    data: SetStateAction<ProposalEvent[]>
  ) => {
    setLoadingProposalEvents(true);
    setProposalEvents(data);
    setLoadingProposalEvents(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingProposalEvents(true);
    api()
      .getProposalEvents()
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.proposalEvents) {
          setProposalEvents(data.proposalEvents);
        }
        setLoadingProposalEvents(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return {
    loadingProposalEvents,
    proposalEvents,
    setProposalEventsWithLoading,
  };
}
