import { useEffect, useState } from "react";
import { UsersQuery } from "../generated/sdk";
import { useDataApi2 } from "./useDataApi2";

export function useUsersData(filter: string) {
  const sendRequest = useDataApi2();
  const [usersData, setUsersData] = useState<UsersQuery["users"] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    sendRequest()
      .users({ filter })
      .then(data => {
        setUsersData(data.users);
        setLoading(false);
      });
  }, [filter, sendRequest]);

  return { loading, usersData };
}
