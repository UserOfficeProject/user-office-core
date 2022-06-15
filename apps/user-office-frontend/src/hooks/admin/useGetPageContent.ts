import { useEffect, useState } from 'react';

import { PageName } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useGetPageContent(pageName: PageName) {
  const [pageContent, setPageContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .getPageContent({
        id: pageName,
      })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.getPageContent) {
          setPageContent(data.getPageContent);
        }
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [pageName, api]);

  return [loading, pageContent] as const;
}
