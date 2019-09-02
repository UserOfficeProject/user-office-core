import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";

export function useCallsData(show) {
  const sendRequest = useDataAPI();
  const [callsData, setCallsData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sendAllCallsRequest = () => {
      const query = `
        query{
            calls{
              id
              shortCode
              startCall
              endCall
            }
          }`;

      sendRequest(query).then(data => {
        setCallsData(
          data.calls.map(call => {
            return {
              id: call.id,
              shortCode: call.shortCode,
              startDate: new Date(parseInt(call.startCall)).toISOString(),
              endDate: new Date(parseInt(call.endCall)).toISOString()
            };
          })
        );
        setLoading(false);
      });
    };
    sendAllCallsRequest();
  }, [sendRequest, show]);

  return { loading, callsData };
}
