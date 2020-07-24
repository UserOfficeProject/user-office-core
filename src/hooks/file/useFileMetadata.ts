import { GetFileMetadataQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useEffect, useState } from 'react';

export function useFileMetadata(fileIds: string[]) {
  const [files, setFiles] = useState<
    Exclude<GetFileMetadataQuery['fileMetadata'], null>
  >([]);

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

  return { files };
}
