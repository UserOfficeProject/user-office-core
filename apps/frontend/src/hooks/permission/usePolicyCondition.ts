import { useState, useEffect } from 'react';

import { ResourceType } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function usePolicyCondition(
  subject: string,
  resource: ResourceType,
  action: string
) {
  const [condition, setCondition] = useState<string | null>(null);
  const [loadingCondition, setLoadingCondition] = useState(true);
  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingCondition(true);
    api()
      .getPolicyCondition({ subject, resourceType: resource, action })
      .then((data) => {
        if (unmounted) {
          return;
        }
        setCondition(data.getPolicyCondition);
        setLoadingCondition(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, subject, resource, action]);

  return { condition, loadingCondition };
}
