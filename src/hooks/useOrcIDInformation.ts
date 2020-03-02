import { useEffect, useState } from "react";
import { useDataApi } from "./useDataApi";
import { GetOrcIdInformationQuery } from "../generated/sdk";

export function useOrcIDInformation(authorizationCode?: string | null) {
  const [orcData, setOrcData] = useState<
    GetOrcIdInformationQuery["getOrcIDInformation"]
  >(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    if (!authorizationCode) {
      setOrcData(null);
      setLoading(false);
      return;
    }
    api()
      .getOrcIDInformation({ authorizationCode })
      .then(data => {
        setOrcData(data.getOrcIDInformation);
        setLoading(false);
      });
  }, [authorizationCode, api]);

  return { loading, orcData };
}
