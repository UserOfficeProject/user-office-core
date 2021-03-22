import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';
export function useDownloadXLSXSEP() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadSEPXLSX = useCallback(
    (sepId: number, callId: number, name: string) => {
      prepareDownload(PREPARE_DOWNLOAD_TYPE.XLSX_SEP, [[sepId, callId]], name);
    },
    [prepareDownload]
  );

  return downloadSEPXLSX;
}
