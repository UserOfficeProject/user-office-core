import { useEffect, useState } from 'react';

import { PermissionsAction } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useCan(
  action: PermissionsAction,
  resourceType: string,
  resourceId?: number
) {
  const api = useDataApi();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let unmounted = false;

    setLoading(true);

    api()
      .getPermissions({
        permissionsAction: action,
        resource: {
          type: resourceType,
          id: resourceId,
        },
      })
      .then((result) => {
        if (unmounted) {
          return;
        }

        setAllowed(result.getPermissions);
        setLoading(false);
      })
      .catch(() => {
        if (!unmounted) {
          setAllowed(false);
          setLoading(false);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [action, resourceId, resourceType, api]);

  return { loading, allowed } as const;
}
