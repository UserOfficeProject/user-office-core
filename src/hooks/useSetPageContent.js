import { useCallback } from "react";
import { useDataAPI } from "./useDataAPI";

export function useSetPageContent() {
  const sendRequest = useDataAPI();

  const sendPageContent = useCallback(
    async (pageName, text) => {
      const query = `
    mutation($id: PageName!, $text: String!) {
      setPageContent(id: $id, text: $text)
    }
    `;
      const variables = {
        id: pageName,
        text
      };

      return await sendRequest(query, variables).then(
        resp => resp.setPageContent
      );
    },
    [sendRequest]
  );

  return sendPageContent;
}
