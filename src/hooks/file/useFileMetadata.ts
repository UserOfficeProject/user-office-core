import { useEffect, useState } from 'react';

import { GetFileMetadataQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFileMetadata(ids: string[]) {
  const [files, setFiles] = useState<
    NonNullable<GetFileMetadataQuery['fileMetadata']>
  >([]);

  const [fileIds, setFileIds] = useState<string[]>(ids);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getFileMetadata({ fileIds })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.fileMetadata) {
          setFiles(data.fileMetadata);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api, fileIds]);

  return { files, setFiles, setFileIds };
}
