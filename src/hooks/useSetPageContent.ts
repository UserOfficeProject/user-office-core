import { useCallback } from "react";
import { useDataApi } from "./useDataApi";

export function useSetPageContent() {
  const api = useDataApi();

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
