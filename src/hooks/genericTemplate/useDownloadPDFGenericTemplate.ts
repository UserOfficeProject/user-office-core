import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';

export function useDownloadPDFGenericTemplate() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadGenericTemplatePDF = useCallback(
    (genericTemplateIds: number[], name: string) => {
      prepareDownload(
        PREPARE_DOWNLOAD_TYPE.PDF_GENERIC_TEMPLATE,
        genericTemplateIds,
        name
      );
    },
    [prepareDownload]
  );

  return downloadGenericTemplatePDF;
}
