import { useEffect, useState } from 'react';

import { Review } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useReviewData(reviewId?: number | null, fapId?: number | null) {
  const [reviewData, setReviewData] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let cancelled = false;

    if (reviewId) {
      setLoading(true);
      api()
        .getReview({ reviewId })
        .then((data) => {
          if (cancelled) {
            return;
          }

          setReviewData(data.review as Review);
          setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [reviewId, fapId, api]);

  return { loading, reviewData, setReviewData };
}
