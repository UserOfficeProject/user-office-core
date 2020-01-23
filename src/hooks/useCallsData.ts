import { useEffect, useState } from "react";
import { useDataApi } from "./useDataApi";
import { GetCallsQuery } from "../generated/sdk";

export function useCallsData(show: boolean) {
  const sendRequest = useDataApi();
  const [callsData, setCallsData] = useState<GetCallsQuery["calls"] | null>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sendAllCallsRequest = () => {
      sendRequest()
        .getCalls()
        .then(data => {
          setCallsData(data.calls);
          setLoading(false);
        });
    };
    sendAllCallsRequest();
  }, [sendRequest, show]);

  return { loading, callsData };
}
