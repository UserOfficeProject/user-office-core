import { useCallback, useEffect, useState } from "react";
import { UserWithReviewsQuery } from "../generated/sdk";
import { useDataApi } from "./useDataApi";

export function useUserWithReviewsData(id: number) {
  const sendRequest = useDataApi();
  const [userData, setUserData] = useState<UserWithReviewsQuery["user"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    sendRequest()
      .userWithReviews({
        id
      })
      .then(data => {
        setUserData(data.user);
        setLoading(false);
      });
  }, [id, sendRequest]);

  return { loading, userData };
}

export function useBasicUserData() {
  const sendRequest = useDataApi();

  const loadBasicUserData = useCallback(
    async (id: number) => {
      return sendRequest()
        .getBasicUserDetails({ id })
        .then(data => data.basicUserDetails);
    },
    [sendRequest]
  );

  return { loadBasicUserData };
}

export interface IBasicUserData {
  firstname: string;
  lastname: string;
  organisation: string;
  id: number;
}
