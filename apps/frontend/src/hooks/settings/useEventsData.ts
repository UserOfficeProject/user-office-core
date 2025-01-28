import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { WorkflowEvent } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useEventsData(entityType: 'proposal' | 'experiment'): {
  loadingEvents: boolean;
  events: WorkflowEvent[];
  setEventsWithLoading: Dispatch<SetStateAction<WorkflowEvent[]>>;
} {
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const api = useDataApi();

  const setEventsWithLoading = (data: SetStateAction<WorkflowEvent[]>) => {
    setLoadingEvents(true);
    setEvents(data);
    setLoadingEvents(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingEvents(true);
    api()
      .getEvents({ entityType })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.events) {
          setEvents(data.events);
        }
        setLoadingEvents(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return {
    loadingEvents,
    events,
    setEventsWithLoading,
  };
}
