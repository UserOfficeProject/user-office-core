import { useState } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useCreateUserInvite() {
  const sendRequest = useDataApi2();
  const [loading, setLoading] = useState(true);
  const createUserInvite = async (
    firstname: string,
    lastname: string,
    email: string
  ) => {
    const variables = {
      firstname,
      lastname,
      email
    };

    setLoading(true);
    const data = await sendRequest().createUserByEmailInvite(variables);
    setLoading(false);
    return data.createUserByEmailInvite;
  };

  return { loading, createUserInvite };
}
