import { useCallback } from 'react';

export function useDownloadPDFProposal() {
  const downloadProposalPDF = useCallback(proposalId => {
    const element = document.createElement('a');
    element.setAttribute('href', '/download/pdf/proposal/' + proposalId);
    element.setAttribute('download', 'download');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }, []);

  return downloadProposalPDF;
}
