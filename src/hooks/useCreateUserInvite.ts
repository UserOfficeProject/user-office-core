import { useState } from "react";
import { useDataApi } from "./useDataApi";

export function useCreateUserInvite() {
  const sendRequest = useDataApi();
  const [loading, setLoading] = useState(true);
  const createUserInvite = async (
    firstname: string,
    lastname: string,
    email: string
  ) => {
    setLoading(true);
    return sendRequest()
      .createUserByEmailInvite({
        firstname,
        lastname,
        email
      })
      .then(data => {
        setLoading(false);
        return data.createUserByEmailInvite;
      });
  };

  return { loading, createUserInvite };
}
