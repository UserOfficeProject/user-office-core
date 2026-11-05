import { useEffect, useState } from 'react';

import { GetRolesQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useRolesData(tagIds?: number[]) {
  const api = useDataApi();
  const [rolesData, setRolesData] = useState<GetRolesQuery['roles']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;
    setLoading(true);
    if (tagIds) {
      api()
        .getRolesByTags({ tagIds })
        .then((data) => {
          if (unmounted) {
            return;
          }
          setRolesData(data.rolesByTags);
          setLoading(false);
        });
    } else {
      api()
        .getRoles()
        .then((data) => {
          if (unmounted) {
            return;
          }

          setRolesData(data.roles);
          setLoading(false);
        });
    }

    return () => {
      unmounted = true;
    };
  }, [api]);

  return { loading, rolesData, setRolesData } as const;
}
