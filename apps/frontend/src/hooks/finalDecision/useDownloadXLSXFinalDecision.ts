import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';
export function useDownloadXLSXFinalDecision() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadFinalDescisionXSLX = useCallback(
    (callId: number, name: string) => {
      prepareDownload(
        PREPARE_DOWNLOAD_TYPE.XLSX_FINAL_DECISION,
        [callId],
        name
      );
    },
    [prepareDownload]
  );

  return downloadFinalDescisionXSLX;
}
