import { useEffect, useState } from "react";
import { GetPageContentQuery, PageName } from "../generated/sdk";
import { useDataApi } from "./useDataApi";

export function useGetPageContent(pageName: PageName) {
  const api = useDataApi();
  const [pageContent, setPageContent] = useState<
    GetPageContentQuery["getPageContent"]
  >(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api()
      .getPageContent({
        id: pageName
      })
      .then(data => {
        setPageContent(data.getPageContent);
        setLoading(false);
      });
  }, [pageName, api]);

  return [loading, pageContent];
}
