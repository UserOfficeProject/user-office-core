import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";

export function useReviewData(id) {
  const sendRequest = useDataAPI();
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const query = `
    query($id: ID!) {
      review(id: $id){
        id
        status
        comment
        grade
        proposal{
          id
          title
          abstract
          proposer{
            id
          }
        }
      }
    }`;

    const variables = {
      id
    };
    setLoading(true);
    sendRequest(query, variables).then(data => {
      setReviewData({
        ...data.review
      });
      setLoading(false);
    });
  }, [id, sendRequest]);

  return { loading, reviewData };
}
