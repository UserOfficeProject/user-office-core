import { useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { Review, ReviewsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useReviewsData(filter: ReviewsFilter) {
  const api = useDataApi();
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentRole } = useContext(UserContext);

  const { callId, questionaryIds, text } = filter;

  useEffect(() => {
    let unmounted = false;

    setLoading(true);

    api()
      .getReviews({
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

        if (data.reviews) {
          setReviewsData(data.reviews.reviews as Review[]);
        }
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [callId, questionaryIds, text, api, currentRole]);

  return { loading, reviewsData, setReviewsData };
}
