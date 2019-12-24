import { useEffect, useState, useCallback } from "react";
import { useDataAPI } from "./useDataAPI";

export function useUserWithReviewsData(id: number) {
  const sendRequest = useDataAPI<any>();
  const [userData, setUserData] = useState<
    (IBasicUserData & { reviews: [] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const query = `
    query($id: Int!) {
      user(id: $id){
        id
        firstname
        lastname
        organisation
        reviews{
          id
          grade
          comment
          proposal{
            id
            title
          }
        }
      }
    }`;

    const variables = {
      id
    };
    setLoading(true);
    sendRequest(query, variables).then(data => {
      setUserData({
        firstname: data.user.firstname,
        lastname: data.user.lastname,
        username: data.user.username,
        id: data.user.id,
        organisation: data.user.organisation,
        reviews: data.user.reviews
      });
      setLoading(false);
    });
  }, [id, sendRequest]);

  return { loading, userData };
}

export function useBasicUserData() {
  const sendRequest = useDataAPI<any>();

  const loadBasicUserData = useCallback(
    async (id: number) => {
      const query = `
        query($id: Int!) {
          basicUserDetails(id: $id){
            id
            firstname
            lastname
            organisation
          }
        }`;

      const variables = {
        id
      };

      return sendRequest(query, variables).then(data => {
        return {
          firstname: data.basicUserDetails.firstname,
          lastname: data.basicUserDetails.lastname,
          id: data.basicUserDetails.id,
          organisation: data.basicUserDetails.organisation
        } as IBasicUserData;
      });
    },
    [sendRequest]
  );

  return { loadBasicUserData };
}

export interface IBasicUserData {
  firstname: string;
  lastname: string;
  username: string;
  organisation: string;
  id: number;
}
