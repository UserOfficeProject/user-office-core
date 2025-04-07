import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';

export function useDownloadXLSXProposal() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadProposalXLSX = useCallback(
    (
      proposalPks: number[],
      name: string,
      techniqueDetailsRequired?: boolean
    ) => {
      if (techniqueDetailsRequired !== undefined && techniqueDetailsRequired) {
        prepareDownload(
          PREPARE_DOWNLOAD_TYPE.XLSX_PROPOSAL_TECHNIQUE,
          proposalPks,
          name
        );
      } else {
        prepareDownload(PREPARE_DOWNLOAD_TYPE.XLSX_PROPOSAL, proposalPks, name);
      }
    },
    [prepareDownload]
  );

  return downloadProposalXLSX;
}
