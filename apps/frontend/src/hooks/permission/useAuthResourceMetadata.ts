// hooks/useResourceMetadata.ts
import { useEffect, useState } from 'react';

import { GetAuthResourceMetadataQuery, ResourceType } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type ResourceMetadata = NonNullable<
  GetAuthResourceMetadataQuery['getAuthResourceMetadata']
>;

export function useAuthResourceMetadata(resourceType: ResourceType) {
  const [metadata, setMetadata] = useState<ResourceMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .getAuthResourceMetadata({ resourceType })
      .then((data) => {
        if (unmounted) {
          return;
        }
        setMetadata(data.getAuthResourceMetadata);
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [resourceType, api]);

  return {
    userAttributes: metadata?.userAttributes ?? [],
    resourceAttributes: metadata?.resourceAttributes ?? [],
    resourceFunctions: metadata?.resourceFunctions ?? [],
    loading,
  };
}
