import { useEffect, useState } from 'react';

import { PageName } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export const FALLBACK_ROLE_FOR_PAGE_CONTENT = -1;

export function useGetPageContents(
  pageName: PageName,
  roleIds?: number | number[]
) {
  const [pageContent, setPageContent] = useState<string | string[]>('');
  const [loading, setLoading] = useState<boolean>(true);
  const sanitisedRoleIds =
    roleIds == null
      ? [FALLBACK_ROLE_FOR_PAGE_CONTENT]
      : Array.isArray(roleIds)
        ? roleIds
        : [roleIds];

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;
    setLoading(true);

    api()
      .getPageContent({
        pageId: pageName,
        roleIds: sanitisedRoleIds,
      })
      .then((data) => {
        if (unmounted) {
          return;
        }
        setPageContent(
          data.pageContent.length === 1
            ? data.pageContent[0].content
            : data.pageContent.map((p) => p.content)
        );
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [pageName, roleIds, api]);

  return [loading, pageContent] as const;
}
