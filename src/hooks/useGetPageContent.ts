import { useEffect, useState } from 'react';

import { GetPageContentQuery, PageName } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useGetPageContent(pageName: PageName) {
  const [pageContent, setPageContent] = useState<
    GetPageContentQuery['getPageContent']
  >(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    setLoading(true);
    api()
      .getPageContent({
        id: pageName,
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
