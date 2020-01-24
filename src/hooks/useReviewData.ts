import { useEffect, useState } from "react";
import { Review } from "../generated/sdk";
import { useDataApi } from "./useDataApi";

export function useReviewData(id: number) {
  const sendRequest = useDataApi();
  const [reviewData, setReviewData] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    sendRequest()
      .getReview({ id })
      .then(data => {
        setReviewData(data.review);
        setLoading(false);
      });
  }, [id, sendRequest]);

  return { loading, reviewData };
}
