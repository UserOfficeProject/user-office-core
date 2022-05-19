import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

import {
  GetScheduledEventsCoreQuery,
  GetScheduledEventsCoreQueryVariables,
} from '../../generated/sdk';

export function useScheduledEvents(
  queryArgs: GetScheduledEventsCoreQueryVariables
) {
  const [args, setArgs] = useState(queryArgs);
  const [scheduledEvents, setScheduledEvents] = useState<
    GetScheduledEventsCoreQuery['scheduledEventsCore']
  >([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingEvents(true);
    api()
      .getScheduledEventsCore(args)
      .then(({ scheduledEventsCore }) => {
        if (unmounted) {
          return;
        }
        if (scheduledEventsCore) {
          setScheduledEvents(scheduledEventsCore);
        }
        setLoadingEvents(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, args]);

  return { scheduledEvents, setScheduledEvents, setArgs, loadingEvents };
}
