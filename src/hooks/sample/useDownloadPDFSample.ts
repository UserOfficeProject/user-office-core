import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';

export function useDownloadPDFSample() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadSamplePDF = useCallback(
    (sampleIds: number[], name: string) => {
      prepareDownload(PREPARE_DOWNLOAD_TYPE.PDF_SAMPLE, sampleIds, name);
    },
    [prepareDownload]
  );

  return downloadSamplePDF;
}
