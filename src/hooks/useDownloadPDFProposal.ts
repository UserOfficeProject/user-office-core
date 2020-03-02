import { useCallback } from "react";

export function useDownloadPDFProposal() {
  const downloadProposalPDF = useCallback(proposalId => {
    var element = document.createElement("a");
    element.setAttribute("href", "/proposal/download/" + proposalId);
    element.setAttribute("download", "download");

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }, []);

  return downloadProposalPDF;
}
