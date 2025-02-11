import { useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { TechnicalReview, TechnicalReviewsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useTechnicalReviewsData(filter: TechnicalReviewsFilter) {
  const api = useDataApi();
  const [technicalReviewsData, setTechnicalReviewsData] = useState<
    TechnicalReview[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { currentRole } = useContext(UserContext);

  const { callId, questionaryIds, text } = filter;

  useEffect(() => {
    let unmounted = false;

    setLoading(true);

    api()
      .getTechnicalReviews({
        filter: {
          callId,
          questionaryIds,
          text,
        },
      })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.technicalReviews) {
          setTechnicalReviewsData(
            data.technicalReviews.technicalReviews as TechnicalReview[]
          );
        }
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [callId, questionaryIds, text, api, currentRole]);

  return { loading, technicalReviewsData, setTechnicalReviewsData };
}
