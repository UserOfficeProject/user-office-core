import { useEffect, useState } from "react";
import { request } from "graphql-request";

export function useGetPageContent(pageName) {
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
    request("/graphql", query, variables).then(data => {
      setPageContent(data.getPageContent);
      setLoading(false);
    });
  }, [pageName]);

  return [loading, pageContent];
}
