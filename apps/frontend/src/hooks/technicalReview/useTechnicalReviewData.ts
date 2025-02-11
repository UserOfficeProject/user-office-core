import { useEffect, useState } from 'react';

import { TechnicalReview } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useTechnicalReviewData(technicalReviewId?: number | null) {
  const [technicalReviewData, setTechnicalReviewData] =
    useState<TechnicalReview | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let cancelled = false;

    if (technicalReviewId) {
      setLoading(true);
      api()
        .getTechnicalReview({ technicalReviewId })
        .then((data) => {
          if (cancelled) {
            return;
          }

          setTechnicalReviewData(data.technicalReview as TechnicalReview);
          setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [technicalReviewId, api]);

  return { loading, technicalReviewData, setTechnicalReviewData };
}
