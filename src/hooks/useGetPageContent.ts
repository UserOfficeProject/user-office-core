import { useEffect, useState } from "react";
import { GetPageContentQuery, PageName } from "../generated/sdk";
import { useDataApi2 } from "./useDataApi2";

export function useGetPageContent(pageName: PageName) {
  const sendRequest = useDataApi2();
  const [pageContent, setPageContent] = useState<
    GetPageContentQuery["getPageContent"]
  >(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const variables = {
      id: pageName
    };
    setLoading(true);
    sendRequest()
      .getPageContent(variables)
      .then(data => {
        setPageContent(data.getPageContent);
        setLoading(false);
      });
  }, [pageName, sendRequest]);

  return [loading, pageContent];
}
