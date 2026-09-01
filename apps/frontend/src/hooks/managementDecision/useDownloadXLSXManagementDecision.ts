import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';
export function useDownloadXLSXManagementDecision() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadManagementDescisionXSLX = useCallback(
    (callId: number, name: string) => {
      prepareDownload(
        PREPARE_DOWNLOAD_TYPE.XLSX_MANAGEMENT_DECISION,
        [callId],
        name
      );
    },
    [prepareDownload]
  );

  return downloadManagementDescisionXSLX;
}
