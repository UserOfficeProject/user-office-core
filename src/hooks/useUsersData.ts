import { useEffect, useState } from "react";
import { useDataApi } from "./useDataApi";
import { GetUsersQuery } from "../generated/sdk";

export function useUsersData(filter: string) {
  const sendRequest = useDataApi();
  const [usersData, setUsersData] = useState<GetUsersQuery["users"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    sendRequest()
      .getUsers({ filter })
      .then(data => {
        setUsersData(data.users);
        setLoading(false);
      });
  }, [filter, sendRequest]);

  return { loading, usersData };
}
