import { useEffect, useState } from "react";
import { Review } from "../generated/sdk";
import { useDataApi2 } from "./useDataApi2";

export function useReviewData(id: number) {
  const sendRequest = useDataApi2();
  const [reviewData, setReviewData] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    sendRequest()
      .review({ id })
      .then(data => {
        setReviewData(data.review);
        setLoading(false);
      });
  }, [id, sendRequest]);

  return { loading, reviewData };
}
