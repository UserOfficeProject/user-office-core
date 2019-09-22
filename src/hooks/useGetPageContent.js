import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";

export function useGetPageContent(pageName) {
  const sendRequest = useDataAPI();
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const query = `
    query($id: PageName!) {
      getPageContent(id: $id)
    }`;

    const variables = {
      id: pageName
    };
    setLoading(true);
    sendRequest(query, variables).then(data => {
      setPageContent(data.getPageContent);
      setLoading(false);
    });
  }, [pageName]);

  return [loading, pageContent];
}
