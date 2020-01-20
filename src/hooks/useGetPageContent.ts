import { useEffect, useState } from "react";
import { PageName } from "../generated/sdk";
import { useDataApi2 } from "./useDataApi2";

export function useGetPageContent(pageName: PageName): [boolean, string] {
  const api = useDataApi2();
  const [pageContent, setPageContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api()
      .getPageContent({
        id: pageName
      })
      .then(data => {
        if (data.getPageContent) {
          setPageContent(data.getPageContent);
        }
        setLoading(false);
      });
  }, [pageName, api]);

  return [loading, pageContent];
}
