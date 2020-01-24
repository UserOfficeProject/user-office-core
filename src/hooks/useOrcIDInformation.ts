import { useEffect, useState } from "react";
import { useDataApi } from "./useDataApi";
import { GetOrcIdInformationQuery } from "../generated/sdk";

export function useOrcIDInformation(
  authorizationCode: string | null | undefined
) {
  const sendRequest = useDataApi();
  const [orcData, setOrcData] = useState<
    GetOrcIdInformationQuery["getOrcIDInformation"]
  >(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!authorizationCode) {
      setOrcData(null);
      setLoading(false);
      return;
    }
    sendRequest()
      .getOrcIDInformation({ authorizationCode })
      .then(data => {
        setOrcData(data.getOrcIDInformation);
        setLoading(false);
      });
  }, [authorizationCode, sendRequest]);

  return { loading, orcData };
}
