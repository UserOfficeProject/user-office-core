import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";

export function useUserData(id) {
  const sendRequest = useDataAPI();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const query = `
    query($id: ID!) {
      user(id: $id){
        id
        firstname
        lastname
        username
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
        name: data.user.firstname,
        surname: data.user.lastname,
        username: data.user.username,
        id: data.user.id,
        reviews: data.user.reviews
      });
      setLoading(false);
    });
  }, [id, sendRequest]);

  return { loading, userData };
}
