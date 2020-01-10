import { useCallback } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useSetPageContent() {
  const api = useDataApi2();

  const sendPageContent = useCallback(
    async (pageName, text) => {
      return api()
        .setPageContent({ id: pageName, text })
        .then(resp => resp.setPageContent);
    },
    [api]
  );

  return sendPageContent;
}
