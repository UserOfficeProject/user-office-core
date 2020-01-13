import { useEffect, useState } from "react";
import { CallsQuery } from "../generated/sdk";
import { useDataApi2 } from "./useDataApi2";

export function useCallsData(show: boolean) {
  const sendRequest = useDataApi2();
  const [callsData, setCallsData] = useState<CallsQuery["calls"] | null>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sendAllCallsRequest = () => {
      sendRequest()
        .calls()
        .then(data => {
          setCallsData(data.calls);
          setLoading(false);
        });
    };
    sendAllCallsRequest();
  }, [sendRequest, show]);

  return { loading, callsData };
}
