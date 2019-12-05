import { useEffect, useState } from "react";
import { request } from "graphql-request";

export function useOrcIDInformation(authorizationCode) {
  const [orcData, setOrcData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const query = `query(
            $authorizationCode: String, 
            )
  {
    getOrcIDInformation(
      authorizationCode: $authorizationCode
              )
     {
      firstname
      lastname
      orcid
      orcidHash
      refreshToken
      token
     }
  }`;
    if (authorizationCode === undefined) {
      return;
    }
    request("/graphql", query, { authorizationCode }).then(data => {
      setOrcData(data.getOrcIDInformation);
      setLoading(false);
    });
  }, [authorizationCode]);

  return { loading, orcData };
}
