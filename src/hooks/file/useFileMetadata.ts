import { useEffect, useState } from 'react';

import { GetFileMetadataQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFileMetadata(ids: string[]) {
  const [files, setFiles] = useState<
    Exclude<GetFileMetadataQuery['fileMetadata'], null>
  >([]);

  const [fileIds, setFileIds] = useState<string[]>(ids);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getFileMetadata({ fileIds })
      .then(data => {
        if (data.fileMetadata) {
          setFiles(data.fileMetadata);
        }
      });
  }, [api, fileIds]);

  return { files, setFiles, setFileIds };
}
