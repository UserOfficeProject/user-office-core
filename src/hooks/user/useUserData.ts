import { useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import {
  GetBasicUserDetailsQuery,
  GetUserMeQuery,
  GetUserMeQueryVariables,
  GetUserQuery,
  GetUserQueryVariables,
  ReviewerFilter,
} from 'generated/sdk';
import { UserWithReviewsQuery, ReviewStatus } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUserData({
  id,
}: GetUserQueryVariables | GetUserMeQueryVariables) {
  const api = useDataApi();
  const { user } = useContext(UserContext);
  const [userData, setUserData] = useState<
    GetUserQuery['user'] | GetUserMeQuery['me']
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    if (user.id !== id) {
      api()
        .getUser({ id })
        .then((data) => {
          if (unmounted || !data.user) {
            return;
          }

          setUserData(data.user);
        });
    } else {
      api()
        .getUserMe()
        .then((data) => {
          if (unmounted || !data.me) {
            return;
          }

          setUserData(data.me);
        });
    }

    return () => {
      unmounted = true;
    };
  }, [api, id, user.id]);

  return { loading, userData, setUserData } as const;
}

export function useUserWithReviewsData(filters?: {
  callId?: number;
  instrumentId?: number;
  status?: ReviewStatus;
  reviewer?: ReviewerFilter;
}) {
  const api = useDataApi();
  const [userWithReviewsFilter, setUserWithReviewsFilter] = useState(filters);
  const [userData, setUserData] = useState<UserWithReviewsQuery['me']>(null);
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
  const [userData, setUserData] =
    useState<GetBasicUserDetailsQuery['basicUserDetails']>(null);
  useEffect(() => {
    if (id) {
      setLoading(true);
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
