import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  DownloadOptions,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';

export function useDownloadXLSXFapReviews() {
  const { prepareDownload } = useContext(DownloadContext);

  const downloadFapReviewsXLSX = useCallback(
    (
      fapId: number,
      callId: number,
      name: string,
      options?: DownloadOptions
    ) => {
      prepareDownload(
        PREPARE_DOWNLOAD_TYPE.XLSX_FAP_REVIEWS,
        [fapId, callId],
        name,
        options
      );
    },
    [prepareDownload]
  );

  return downloadFapReviewsXLSX;
}
