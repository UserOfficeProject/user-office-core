import { useCallback } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useSetPageContent() {
  const sendRequest = useDataApi2();

  const sendPageContent = useCallback(
    async (pageName, text) => {
      return await (await sendRequest())
        .setPageContent({ id: pageName, text })
        .then(resp => resp.setPageContent);
    },
    [sendRequest]
  );

  return sendPageContent;
}
