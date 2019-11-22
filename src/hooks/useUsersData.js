import { useEffect, useState } from "react";
import { useDataAPI } from "../hooks/useDataAPI";

export function useUsersData(filter) {
  const sendRequest = useDataAPI();
  const [usersData, setUsersData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const query = `
    query($filter: String!) {
      users(filter: $filter){
        users{
        firstname
        lastname
        organisation
        id
        }
        totalCount
      }
    }`;

    const variables = {
      filter: filter
    };
    setLoading(true);
    sendRequest(query, variables).then(data => {
      setUsersData(
        data.users.users.map(user => {
          return {
            firstname: user.firstname,
            lastname: user.lastname,
            organisation: user.organisation,
            id: user.id
          };
        })
      );
      setLoading(false);
    });
  }, [filter, sendRequest]);

  return { loading, usersData };
}
