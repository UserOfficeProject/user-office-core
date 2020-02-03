import { useEffect, useState } from "react";
import { useDataApi } from "./useDataApi";
import { GetCallsQuery } from "../generated/sdk";

export function useCallsData(show: boolean) {
  const [callsData, setCallsData] = useState<GetCallsQuery["calls"] | null>();
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getCalls()
      .then(data => {
        setCallsData(data.calls);
        setLoading(false);
      });
  }, [api, show]);

  return { loading, callsData };
}
