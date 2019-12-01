import { useState } from "react";
import { useDataAPI } from "./useDataAPI";

export function useCreateUserInvite() {
  const sendRequest = useDataAPI();
  const [loading, setLoading] = useState(true);
  const createUserInvite = async (
    firstname: string,
    lastname: string,
    email: string
  ) => {
    const query = `
    mutation($firstname: String!, $lastname: String!, $email: String!){
        createUserByEmailInvite(firstname: $firstname, lastname: $lastname, email: $email)
    }
    `;
    const variables = {
      firstname,
      lastname,
      email
    };

    setLoading(true);
    const data = await sendRequest(query, variables);
    return data.createUserByEmailInvite;
  };

  return { loading, createUserInvite };
}
