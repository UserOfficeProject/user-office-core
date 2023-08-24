import { SetStateAction, useEffect, useState } from 'react';

import { InternalReview, InternalReviewsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInternalReviewsData(filter: InternalReviewsFilter) {
  const [internalReviews, setInternalReviews] = useState<InternalReview[]>([]);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();
  const { technicalReviewId } = filter;

  const setInternalReviewsWithLoading = (
    data: SetStateAction<InternalReview[]>
  ) => {
    setLoading(true);
    setInternalReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    if (technicalReviewId) {
      setLoading(true);
      api()
        .getInternalReviews({
          filter: { technicalReviewId },
        })
        .then((data) => {
          if (cancelled) {
            return;
          }

          setInternalReviews((data.internalReviews || []) as InternalReview[]);
          setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [technicalReviewId, api]);

  return { loading, internalReviews, setInternalReviewsWithLoading };
}
