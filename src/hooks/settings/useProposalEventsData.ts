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
    setLoadingProposalEvents(true);
    api()
      .getProposalEvents()
      .then(data => {
        if (data.proposalEvents) {
          setProposalEvents(data.proposalEvents);
        }
        setLoadingProposalEvents(false);
      });
  }, [api]);

  return {
    loadingProposalEvents,
    proposalEvents,
    setProposalEventsWithLoading,
  };
}
