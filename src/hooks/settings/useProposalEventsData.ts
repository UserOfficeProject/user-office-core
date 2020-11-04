import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { Event } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalEventsData(): {
  loadingProposalEvents: boolean;
  proposalEvents: Event[];
  setProposalEventsWithLoading: Dispatch<SetStateAction<Event[]>>;
} {
  const [proposalEvents, setProposalEvents] = useState<Event[]>([]);
  const [loadingProposalEvents, setLoadingProposalEvents] = useState(true);

  const api = useDataApi();

  const setProposalEventsWithLoading = (data: SetStateAction<Event[]>) => {
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
