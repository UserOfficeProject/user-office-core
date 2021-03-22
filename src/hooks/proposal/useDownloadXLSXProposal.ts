import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';

export function useDownloadXLSXProposal() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadProposalXLSX = useCallback(
    (proposalIds: number[], name: string) => {
      prepareDownload(PREPARE_DOWNLOAD_TYPE.XLSX_PROPOSAL, proposalIds, name);
    },
    [prepareDownload]
  );

  return downloadProposalXLSX;
}
