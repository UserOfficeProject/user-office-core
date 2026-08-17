import { useEffect, useState } from 'react';

import { PageName } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useGetPageContent(pageName: PageName, roleId?: number) {
  const [pageContent, setPageContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;
    setLoading(true);
    api()
      .getPageContent({
        pageId: pageName,
        roleId: roleId === 0 ? undefined : roleId
      })
      .then((data) => {
        if (unmounted) {
          return;
        }

        setPageContent(data.pageContent ?? "");
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [pageName, roleId, api]);

  return [loading, pageContent] as const;
}
