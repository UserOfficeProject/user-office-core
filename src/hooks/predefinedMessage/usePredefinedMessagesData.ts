import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { PredefinedMessage } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function usePredefinedMessagesData(): {
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
      .getPredefinedMessages()
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
  }, [api]);

  return {
    loadingPredefinedMessages,
    predefinedMessages,
    setPredefinedMessages,
  };
}
