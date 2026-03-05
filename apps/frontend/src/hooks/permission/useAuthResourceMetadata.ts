import { useEffect, useState } from 'react';

import { GetAuthResourceMetadataQuery, ResourceType } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type ResourceMetadata = NonNullable<
  GetAuthResourceMetadataQuery['getAuthResourceMetadata']
>;

export function useAuthResourceMetadata(resourceType: ResourceType) {
  const [metadata, setMetadata] = useState<ResourceMetadata | null>(null);
  const [loadingMetaData, setLoadingMetaData] = useState(true);
  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingMetaData(true);
    api()
      .getAuthResourceMetadata({ resourceType })
      .then((data) => {
        if (unmounted) {
          return;
        }
        setMetadata(data.getAuthResourceMetadata);
        setLoadingMetaData(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, resourceType]);

  return {
    userAttributes: metadata?.userAttributes ?? [],
    resourceAttributes: metadata?.resourceAttributes ?? [],
    resourceFunctions: metadata?.resourceFunctions ?? [],
    loadingMetaData,
  };
}
