import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';
export function useDownloadXLSXFap() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadFapXLSX = useCallback(
    (fapId: number, callId: number, name: string) => {
      prepareDownload(PREPARE_DOWNLOAD_TYPE.XLSX_Fap, [[fapId, callId]], name);
    },
    [prepareDownload]
  );

  return downloadFapXLSX;
}
