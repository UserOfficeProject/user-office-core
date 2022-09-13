import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { PredefinedMessage, PredefinedMessagesFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function usePredefinedMessagesData({ key }: PredefinedMessagesFilter): {
  loadingPredefinedMessages: boolean;
  predefinedMessages: PredefinedMessage[];
  setPredefinedMessages: Dispatch<SetStateAction<PredefinedMessage[]>>;
} {
  const [predefinedMessages, setPredefinedMessages] = useState<
    PredefinedMessage[]
  >([]);
  const [loadingPredefinedMessages, setLoadingPredefinedMessages] =
    useState(true);

  const api = useDataApi();

  useEffect(() => {
    let cancelled = false;
    setLoadingPredefinedMessages(true);
    api()
      .getPredefinedMessages({ filter: { key } })
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (data.predefinedMessages) {
          setPredefinedMessages(data.predefinedMessages);
        }
        setLoadingPredefinedMessages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api, key]);

  return {
    loadingPredefinedMessages,
    predefinedMessages,
    setPredefinedMessages,
  };
}
