import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';

export function useDownloadPDFExperimentSafety() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadExperimentSafetyPDF = useCallback(
    (experimentPks: number[], name: string, downloadType?: string) => {
      if (downloadType !== undefined && downloadType === 'zip') {
        prepareDownload(
          PREPARE_DOWNLOAD_TYPE.ZIP_EXPERIMENT_SAFETY,
          experimentPks,
          name
        );
      } else {
        prepareDownload(
          PREPARE_DOWNLOAD_TYPE.PDF_EXPERIMENT_SAFETY,
          experimentPks,
          name
        );
      }
    },
    [prepareDownload]
  );

  return downloadExperimentSafetyPDF;
}
