import { useEffect, useState } from 'react';

import { GetFeedbackQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFeedback(feedbackId: number) {
  const [feedback, setFeedback] = useState<GetFeedbackQuery['feedback'] | null>(
    null
  );

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getFeedback({ feedbackId: feedbackId })
      .then((data) => {
        if (unmounted) {
          return;
        }
        if (data.feedback) {
          setFeedback(data.feedback);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api, feedbackId]);

  return { feedback };
}
