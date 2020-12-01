import { useCallback } from 'react';

export function useDownloadXLSXProposal() {
  const downloadProposalXLSX = useCallback(proposalId => {
    const element = document.createElement('a');
    element.setAttribute('href', '/download/xlsx/proposal/' + proposalId);
    element.setAttribute('download', 'download');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }, []);

  return downloadProposalXLSX;
}
