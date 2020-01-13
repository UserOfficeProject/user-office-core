import { useEffect, useState } from "react";
import { GetPageContentQuery, PageName } from "../generated/sdk";
import { useDataApi2 } from "./useDataApi2";

export function useGetPageContent(pageName: PageName) {
  const api = useDataApi2();
  const [pageContent, setPageContent] = useState<
    GetPageContentQuery["getPageContent"]
  >(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const variables = {
      id: pageName
    };
    setLoading(true);
    api()
      .getPageContent(variables)
      .then(data => {
        setPageContent(data.getPageContent);
        setLoading(false);
      });
  }, [pageName, api]);

  return [loading, pageContent];
}
