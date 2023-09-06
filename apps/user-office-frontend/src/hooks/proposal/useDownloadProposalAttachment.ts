import { useCallback, useContext } from 'react';

import {
  DownloadContext,
  DownloadOptions,
  PREPARE_DOWNLOAD_TYPE,
} from 'context/DownloadContextProvider';

export function useDownloadProposalAttachment() {
  const { prepareDownload } = useContext(DownloadContext);
  const downloadProposalAttachment = useCallback(
    (proposalPks: number[], options: DownloadOptions) => {
      prepareDownload(
        PREPARE_DOWNLOAD_TYPE.ZIP_ATTACHMENT,
        proposalPks,
        'attachment',
        options
      );
    },
    [prepareDownload]
  );

  return downloadProposalAttachment;
}
