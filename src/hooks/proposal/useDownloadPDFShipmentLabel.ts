import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';

export function useDownloadPDFShipmentLabel() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadShipmentLabelPdf = useCallback(
    (shipmentIds: number[], name: string) => {
      prepareDownload(
        PREPARE_DOWNLOAD_TYPE.PDF_SHIPMENT_LABEL,
        shipmentIds,
        name
      );
    },
    [prepareDownload]
  );

  return downloadShipmentLabelPdf;
}
