import { useEffect, useState } from 'react';

import {
  GetFapReviewVisibilityOptionsQuery,
  ReviewVisibility,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFapReviewVisibilityOptions(): {
  reviewVisibilityOptions: ReviewVisibility[];
  isLoadingVisibilityOptions: boolean;
} {
  const api = useDataApi();
  const [reviewVisibilityOptions, setReviewVisibilityOptions] = useState<
    ReviewVisibility[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;

    setIsLoading(true);

    api()
      .getFapReviewVisibilityOptions()
      .then((data: GetFapReviewVisibilityOptionsQuery) => {
        if (unmounted) {
          return;
        }

        if (data.fapReviewVisibilityOptions) {
          setReviewVisibilityOptions(data.fapReviewVisibilityOptions);
        }
        setIsLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return {
    reviewVisibilityOptions,
    isLoadingVisibilityOptions: isLoading,
  };
}
