import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';
export function useDownloadXLSXCallFap() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadFapXLSX = useCallback(
    (callId: number, name: string) => {
      prepareDownload(PREPARE_DOWNLOAD_TYPE.XLSX_CALL_FAP, [callId], name);
    },
    [prepareDownload]
  );

  return downloadFapXLSX;
}
