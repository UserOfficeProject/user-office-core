import { useEffect, useState } from 'react';

import { FilesMetadataFilter, GetFilesMetadataQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFilesMetadata(filesFilter: FilesMetadataFilter) {
  const [files, setFiles] = useState<GetFilesMetadataQuery['filesMetadata']>(
    []
  );

  const [filter, setFilter] = useState<FilesMetadataFilter>(filesFilter);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getFilesMetadata({ filter: filter })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.filesMetadata) {
          setFiles(data.filesMetadata);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api, filter]);

  return { files, setFiles, setFilter };
}
