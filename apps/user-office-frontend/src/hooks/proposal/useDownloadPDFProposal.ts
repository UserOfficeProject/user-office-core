import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
  ProposalPdfDownloadOptions,
} from 'context/DownloadContextProvider';

export function useDownloadPDFProposal() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadProposalPDF = useCallback(
    (
      proposalPks: number[],
      name: string,
      options?: ProposalPdfDownloadOptions
    ) => {
      prepareDownload(
        PREPARE_DOWNLOAD_TYPE.PDF_PROPOSAL,
        proposalPks,
        name,
        options
      );
    },
    [prepareDownload]
  );

  return downloadProposalPDF;
}
