import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';

export function useDownloadPDFProposal() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadProposalPDF = useCallback(
    (proposalPks: number[], name: string) => {
      prepareDownload(PREPARE_DOWNLOAD_TYPE.PDF_PROPOSAL, proposalPks, name);
    },
    [prepareDownload]
  );

  return downloadProposalPDF;
}
