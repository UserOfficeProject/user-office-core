import { useEffect, useState } from 'react';

import { ReviewerFilter } from 'generated/sdk';
import {
  UserWithReviewsQuery,
  ReviewStatus,
  BasicUserDetails,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUserWithReviewsData(filters?: {
  callId?: number;
  instrumentId?: number;
  status?: ReviewStatus;
  reviewer?: ReviewerFilter;
}) {
  const api = useDataApi();
  const [userWithReviewsFilter, setUserWithReviewsFilter] = useState(filters);
  const [userData, setUserData] = useState<UserWithReviewsQuery['me'] | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .userWithReviews(userWithReviewsFilter)
      .then((data) => {
        if (unmounted) {
          return;
        }

        setUserData(data.me);
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [userWithReviewsFilter, api]);

  return { loading, userData, setUserData, setUserWithReviewsFilter } as const;
}

export function useBasicUserData(id?: number) {
  const api = useDataApi();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<BasicUserDetails | null>(null);
  useEffect(() => {
    setLoading(true);
    if (id) {
      api()
        .getBasicUserDetails({ id })
        .then((data) => {
          setUserData(data.basicUserDetails);
          setLoading(false);
        });
    }
  }, [api, id]);

  return { loading, userData };
}

export interface BasicUserData {
  firstname: string;
  lastname: string;
  organisation: string;
  id: number;
}
